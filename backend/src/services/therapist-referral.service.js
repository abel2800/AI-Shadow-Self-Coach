/**
 * Therapist Referral Service
 * Handles therapist referral logic and integration with external services
 * 
 * For MVP, this is a placeholder that simulates the referral process.
 * In production, integrate with services like:
 * - Psychology Today API
 * - BetterHelp API
 * - Local therapist directories
 * - Insurance provider networks
 */

const { TherapistReferral } = require('../models');
const logger = require('../utils/logger');

/**
 * Create a new therapist referral request
 */
async function createReferral(userId, preferences, consentForContact) {
  try {
    // Estimate response time (24-48 hours for MVP)
    const estimatedResponse = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const referral = await TherapistReferral.create({
      user_id: userId,
      status: 'pending',
      preferences: preferences || {},
      consent_for_contact: consentForContact || false,
      estimated_response: estimatedResponse
    });

    logger.info(`Therapist referral created: ${referral.id}`, { userId });

    // In production, this would trigger:
    // 1. Send request to external referral service
    // 2. Queue background job to process referral
    // 3. Send confirmation email to user

    // For MVP, simulate processing
    setTimeout(async () => {
      await processReferral(referral.id);
    }, 1000); // Process after 1 second (simulated)

    return referral;
  } catch (error) {
    logger.error('Failed to create therapist referral', error);
    throw error;
  }
}

/**
 * Process a referral (simulated for MVP)
 * In production, this would:
 * 1. Query external therapist directory
 * 2. Match based on preferences (location, insurance, specialties)
 * 3. Send referral request to matched therapist
 * 4. Update referral status
 */
async function processReferral(referralId) {
  try {
    const referral = await TherapistReferral.findByPk(referralId);
    
    if (!referral) {
      logger.warn(`Referral not found: ${referralId}`);
      return;
    }

    if (referral.status !== 'pending') {
      logger.warn(`Referral already processed: ${referralId}`);
      return;
    }

    // Update status to processing
    await referral.update({ status: 'processing' });

    // Simulate matching process
    // In production, this would query external API
    const matchedTherapist = await findMatchingTherapist(referral.preferences);

    if (matchedTherapist) {
      await referral.update({
        status: 'matched',
        matched_therapist_id: matchedTherapist.id,
        matched_therapist_info: {
          name: matchedTherapist.name,
          phone: matchedTherapist.phone,
          email: matchedTherapist.email,
          specialties: matchedTherapist.specialties,
          location: matchedTherapist.location,
          accepts_insurance: matchedTherapist.acceptsInsurance
        },
        responded_at: new Date()
      });

      logger.info(`Therapist matched for referral: ${referralId}`, {
        therapistId: matchedTherapist.id
      });

      // In production, send notification to user
    } else {
      // No match found - keep in processing for manual review
      await referral.update({
        notes: 'No automatic match found. Requires manual review.'
      });

      logger.warn(`No therapist match found for referral: ${referralId}`);
    }
  } catch (error) {
    logger.error(`Failed to process referral: ${referralId}`, error);
    
    // Update referral with error
    try {
      const referral = await TherapistReferral.findByPk(referralId);
      if (referral) {
        await referral.update({
          status: 'processing',
          notes: `Processing error: ${error.message}`
        });
      }
    } catch (updateError) {
      logger.error('Failed to update referral after error', updateError);
    }
  }
}

/**
 * Find matching therapist based on preferences
 * This is a placeholder - in production, integrate with external API
 */
async function findMatchingTherapist(preferences) {
  // For MVP, return a simulated therapist
  // In production, query external service (Psychology Today, BetterHelp, etc.)
  
  const mockTherapist = {
    id: `therapist_${Date.now()}`,
    name: 'Dr. Jane Smith',
    phone: '(555) 123-4567',
    email: 'jane.smith@example.com',
    specialties: preferences?.specialties || ['anxiety', 'depression', 'self-worth'],
    location: preferences?.location || 'Remote',
    acceptsInsurance: preferences?.insurance || false
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return mockTherapist;
}

/**
 * Get referral by ID
 */
async function getReferral(referralId, userId) {
  const referral = await TherapistReferral.findOne({
    where: {
      id: referralId,
      user_id: userId
    }
  });

  return referral;
}

/**
 * Get all referrals for a user
 */
async function getUserReferrals(userId, limit = 10, offset = 0) {
  const referrals = await TherapistReferral.findAndCountAll({
    where: { user_id: userId },
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  return referrals;
}

/**
 * Update referral status
 */
async function updateReferralStatus(referralId, status, notes = null) {
  const referral = await TherapistReferral.findByPk(referralId);
  
  if (!referral) {
    throw new Error('Referral not found');
  }

  const updateData = { status };
  if (notes) {
    updateData.notes = notes;
  }

  if (status === 'completed' || status === 'matched') {
    updateData.responded_at = new Date();
  }

  await referral.update(updateData);

  return referral;
}

/**
 * Cancel a referral
 */
async function cancelReferral(referralId, userId) {
  const referral = await TherapistReferral.findOne({
    where: {
      id: referralId,
      user_id: userId
    }
  });

  if (!referral) {
    throw new Error('Referral not found');
  }

  if (referral.status === 'completed' || referral.status === 'cancelled') {
    throw new Error('Cannot cancel referral in current status');
  }

  await referral.update({
    status: 'cancelled',
    notes: 'Cancelled by user'
  });

  return referral;
}

module.exports = {
  createReferral,
  processReferral,
  getReferral,
  getUserReferrals,
  updateReferralStatus,
  cancelReferral
};

