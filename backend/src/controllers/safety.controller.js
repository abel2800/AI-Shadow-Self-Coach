const { v4: uuidv4 } = require('uuid');
const { SafetyCheckIn } = require('../models');
const therapistReferralService = require('../services/therapist-referral.service');

// Submit safety check-in
exports.submitCheckIn = async (req, res, next) => {
  try {
    const { session_id, safety_status, message } = req.body;
    const user_id = req.user.id;

    // Validate safety status
    const validStatuses = ['safe', 'unsure', 'needs_support'];
    if (!validStatuses.includes(safety_status)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_INVALID_FORMAT',
          message: 'Invalid safety status'
        }
      });
    }

    // Schedule next check-in (24 hours)
    const nextCheckIn = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Save check-in to database
    const checkIn = await SafetyCheckIn.create({
      id: uuidv4(),
      user_id,
      session_id: session_id || null,
      safety_status,
      message: message || null,
      next_check_in: nextCheckIn
    });

    res.status(200).json({
      check_in_id: checkIn.id,
      safety_status: checkIn.safety_status,
      timestamp: checkIn.created_at,
      next_check_in: checkIn.next_check_in.toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Get crisis resources
exports.getResources = async (req, res, next) => {
  try {
    const { country, region } = req.query;

    // Default to US resources
    const resources = [
      {
        type: 'crisis_hotline',
        name: 'National Suicide Prevention Lifeline',
        phone: process.env.CRISIS_HOTLINE_US || '988',
        available_24_7: true
      },
      {
        type: 'crisis_text',
        name: 'Crisis Text Line',
        text: 'Text HOME to 741741',
        available_24_7: true
      }
    ];

    // Add local resources based on country/region
    if (country === 'US' && region) {
      // Map of common US regions to crisis resources
      const usResources = {
        'CA': { name: 'California Crisis Line', phone: '1-800-273-8255' },
        'NY': { name: 'New York Crisis Line', phone: '1-888-NYC-WELL' },
        'TX': { name: 'Texas Crisis Line', phone: '1-800-273-8255' },
        'FL': { name: 'Florida Crisis Line', phone: '1-800-273-8255' },
        'IL': { name: 'Illinois Crisis Line', phone: '1-800-273-8255' }
      };
      
      const localResource = usResources[region.toUpperCase()];
      if (localResource) {
        resources.push({
          type: 'local_center',
          name: localResource.name,
          phone: localResource.phone,
          available_24_7: true
        });
      } else {
        // Default local resource
        resources.push({
          type: 'local_center',
          name: 'Local Crisis Center',
          phone: '1-800-273-8255',
          available_24_7: true
        });
      }
    }

    res.status(200).json({
      resources,
      location: {
        country: country || 'US',
        region: region || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Request therapist referral
exports.requestReferral = async (req, res, next) => {
  try {
    const { preferences, consent_for_contact } = req.body;
    const user_id = req.user.id;

    // Validate preferences structure
    if (preferences && typeof preferences !== 'object') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_INVALID_FORMAT',
          message: 'Preferences must be an object'
        }
      });
    }

    // Create referral
    const referral = await therapistReferralService.createReferral(
      user_id,
      preferences,
      consent_for_contact
    );

    res.status(201).json({
      referral_id: referral.id,
      status: referral.status,
      estimated_response: referral.estimated_response.toISOString(),
      created_at: referral.created_at
    });
  } catch (error) {
    next(error);
  }
};

// Get referral status
exports.getReferralStatus = async (req, res, next) => {
  try {
    const { referral_id } = req.params;
    const user_id = req.user.id;

    const referral = await therapistReferralService.getReferral(referral_id, user_id);

    if (!referral) {
      return res.status(404).json({
        error: {
          code: 'REFERRAL_NOT_FOUND',
          message: 'Referral not found'
        }
      });
    }

    res.status(200).json({
      referral_id: referral.id,
      status: referral.status,
      preferences: referral.preferences,
      consent_for_contact: referral.consent_for_contact,
      matched_therapist: referral.matched_therapist_info,
      estimated_response: referral.estimated_response?.toISOString(),
      responded_at: referral.responded_at?.toISOString(),
      created_at: referral.created_at,
      updated_at: referral.updated_at
    });
  } catch (error) {
    next(error);
  }
};

// List user referrals
exports.listReferrals = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const result = await therapistReferralService.getUserReferrals(
      user_id,
      parseInt(limit),
      parseInt(offset)
    );

    res.status(200).json({
      referrals: result.rows.map(referral => ({
        referral_id: referral.id,
        status: referral.status,
        matched_therapist: referral.matched_therapist_info,
        estimated_response: referral.estimated_response?.toISOString(),
        created_at: referral.created_at
      })),
      total: result.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
};

// Cancel referral
exports.cancelReferral = async (req, res, next) => {
  try {
    const { referral_id } = req.params;
    const user_id = req.user.id;

    const referral = await therapistReferralService.cancelReferral(referral_id, user_id);

    res.status(200).json({
      referral_id: referral.id,
      status: referral.status,
      message: 'Referral cancelled successfully'
    });
  } catch (error) {
    if (error.message === 'Referral not found') {
      return res.status(404).json({
        error: {
          code: 'REFERRAL_NOT_FOUND',
          message: error.message
        }
      });
    }
    if (error.message.includes('Cannot cancel')) {
      return res.status(400).json({
        error: {
          code: 'INVALID_OPERATION',
          message: error.message
        }
      });
    }
    next(error);
  }
};

