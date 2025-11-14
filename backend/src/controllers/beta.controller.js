const { BetaTester, BetaFeedback, User } = require('../models');
const { v4: uuidv4 } = require('uuid');

/**
 * Enroll user in beta testing
 */
exports.enrollBetaTester = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { cohort = 'general', feedback_consent = true } = req.body;

    // Check if already enrolled
    const existing = await BetaTester.findOne({ where: { user_id } });
    if (existing) {
      return res.status(400).json({
        error: {
          code: 'ALREADY_ENROLLED',
          message: 'User is already enrolled in beta testing'
        }
      });
    }

    // Create beta tester record
    const betaTester = await BetaTester.create({
      id: uuidv4(),
      user_id,
      cohort,
      feedback_consent,
      status: 'active'
    });

    res.status(201).json({
      beta_tester_id: betaTester.id,
      cohort: betaTester.cohort,
      status: betaTester.status,
      enrolled_at: betaTester.enrolled_at
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get beta tester status
 */
exports.getBetaTesterStatus = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const betaTester = await BetaTester.findOne({ where: { user_id } });

    if (!betaTester) {
      return res.status(404).json({
        error: {
          code: 'NOT_ENROLLED',
          message: 'User is not enrolled in beta testing'
        }
      });
    }

    res.status(200).json({
      beta_tester_id: betaTester.id,
      cohort: betaTester.cohort,
      status: betaTester.status,
      feedback_consent: betaTester.feedback_consent,
      test_group: betaTester.test_group,
      enrolled_at: betaTester.enrolled_at,
      created_at: betaTester.created_at
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit beta feedback
 */
exports.submitFeedback = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const {
      feedback_type = 'general',
      category,
      rating,
      title,
      content,
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_REQUIRED_FIELD',
          message: 'Content is required'
        }
      });
    }

    // Get beta tester record (optional)
    const betaTester = await BetaTester.findOne({ where: { user_id } });

    // Check feedback consent
    if (betaTester && !betaTester.feedback_consent) {
      return res.status(403).json({
        error: {
          code: 'CONSENT_REQUIRED',
          message: 'Feedback consent is required to submit feedback'
        }
      });
    }

    // Add metadata
    const feedbackMetadata = {
      ...metadata,
      app_version: metadata.app_version || 'unknown',
      device_info: metadata.device_info || 'unknown',
      timestamp: new Date().toISOString()
    };

    // Determine priority based on feedback type
    let priority = 'medium';
    if (feedback_type === 'bug_report') {
      priority = metadata.severity === 'critical' ? 'critical' : 'high';
    } else if (feedback_type === 'feature_request') {
      priority = 'low';
    }

    // Create feedback
    const feedback = await BetaFeedback.create({
      id: uuidv4(),
      user_id,
      beta_tester_id: betaTester?.id || null,
      feedback_type,
      category,
      rating,
      title: title || null,
      content: content.trim(),
      metadata: feedbackMetadata,
      status: 'new',
      priority
    });

    res.status(201).json({
      feedback_id: feedback.id,
      feedback_type: feedback.feedback_type,
      status: feedback.status,
      created_at: feedback.created_at
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's feedback history
 */
exports.getFeedbackHistory = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { limit = 20, offset = 0, feedback_type, status } = req.query;

    const where = { user_id };
    if (feedback_type) where.feedback_type = feedback_type;
    if (status) where.status = status;

    const result = await BetaFeedback.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      feedback: result.rows.map(f => ({
        feedback_id: f.id,
        feedback_type: f.feedback_type,
        category: f.category,
        rating: f.rating,
        title: f.title,
        status: f.status,
        priority: f.priority,
        created_at: f.created_at,
        responded_at: f.responded_at
      })),
      total: result.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update feedback consent
 */
exports.updateFeedbackConsent = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { feedback_consent } = req.body;

    if (typeof feedback_consent !== 'boolean') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_INVALID_FORMAT',
          message: 'feedback_consent must be a boolean'
        }
      });
    }

    const betaTester = await BetaTester.findOne({ where: { user_id } });

    if (!betaTester) {
      return res.status(404).json({
        error: {
          code: 'NOT_ENROLLED',
          message: 'User is not enrolled in beta testing'
        }
      });
    }

    await betaTester.update({ feedback_consent });

    res.status(200).json({
      feedback_consent: betaTester.feedback_consent,
      updated_at: betaTester.updated_at
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw from beta testing (admin or user)
 */
exports.withdrawFromBeta = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const betaTester = await BetaTester.findOne({ where: { user_id } });

    if (!betaTester) {
      return res.status(404).json({
        error: {
          code: 'NOT_ENROLLED',
          message: 'User is not enrolled in beta testing'
        }
      });
    }

    await betaTester.update({ status: 'withdrawn' });

    res.status(200).json({
      message: 'Successfully withdrawn from beta testing',
      status: betaTester.status
    });
  } catch (error) {
    next(error);
  }
};

