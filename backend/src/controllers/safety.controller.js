const { v4: uuidv4 } = require('uuid');

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

    // TODO: Save check-in to database
    const check_in_id = uuidv4();

    // Schedule next check-in (24 hours)
    const nextCheckIn = new Date(Date.now() + 24 * 60 * 60 * 1000);

    res.status(200).json({
      check_in_id,
      safety_status,
      timestamp: new Date(),
      next_check_in: nextCheckIn.toISOString()
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

    // TODO: Add local resources based on country/region
    if (country === 'US' && region) {
      resources.push({
        type: 'local_center',
        name: 'Local Crisis Center',
        phone: '+1-555-123-4567', // TODO: Use actual local resources API
        address: '123 Main St, City, State 12345',
        available_24_7: true
      });
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

    // TODO: Implement therapist referral service
    const referral_id = uuidv4();

    res.status(200).json({
      referral_id,
      status: 'processing',
      estimated_response: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    next(error);
  }
};

