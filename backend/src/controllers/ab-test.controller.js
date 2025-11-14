/**
 * A/B Test Controller
 * Handles A/B test management endpoints
 */

const abTestService = require('../services/ab-test.service');
const { ABTest } = require('../models');

/**
 * Create a new A/B test
 */
exports.createTest = async (req, res, next) => {
  try {
    const test = await abTestService.createABTest(req.body);
    res.status(201).json({
      test_id: test.id,
      name: test.name,
      status: test.status,
      model_type: test.model_type,
      variant_a: test.variant_a,
      variant_b: test.variant_b,
      traffic_split: test.traffic_split
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all A/B tests
 */
exports.listTests = async (req, res, next) => {
  try {
    const { model_type, status } = req.query;
    const where = {};
    
    if (model_type) {
      where.model_type = model_type;
    }
    if (status) {
      where.status = status;
    }

    const tests = await ABTest.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      tests: tests.map(test => ({
        test_id: test.id,
        name: test.name,
        model_type: test.model_type,
        variant_a: test.variant_a,
        variant_b: test.variant_b,
        traffic_split: test.traffic_split,
        status: test.status,
        start_date: test.start_date,
        end_date: test.end_date,
        metrics: test.metrics
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get A/B test by ID
 */
exports.getTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stats = await abTestService.getTestStats(id);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Start an A/B test
 */
exports.startTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const test = await abTestService.startTest(id);
    res.status(200).json({
      test_id: test.id,
      status: test.status,
      start_date: test.start_date
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pause an A/B test
 */
exports.pauseTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const test = await abTestService.pauseTest(id);
    res.status(200).json({
      test_id: test.id,
      status: test.status
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete an A/B test
 */
exports.completeTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { winner } = req.body; // 'a', 'b', or null
    const test = await abTestService.completeTest(id, winner);
    res.status(200).json({
      test_id: test.id,
      status: test.status,
      end_date: test.end_date,
      winner
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's assigned variant
 */
exports.getUserVariant = async (req, res, next) => {
  try {
    const { model_type } = req.query;
    const userId = req.user.id;

    if (!model_type) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'model_type is required'
        }
      });
    }

    const versionInfo = await abTestService.getModelVersionForUser(userId, model_type);
    
    if (!versionInfo) {
      return res.status(200).json({
        variant: null,
        version: null,
        message: 'No active A/B test for this model type'
      });
    }

    res.status(200).json({
      variant: versionInfo.variant,
      version: versionInfo.version,
      test_id: versionInfo.test_id,
      test_name: versionInfo.test_name
    });
  } catch (error) {
    next(error);
  }
};

