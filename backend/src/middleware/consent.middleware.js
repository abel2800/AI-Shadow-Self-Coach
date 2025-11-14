/**
 * Consent Middleware
 * Checks if user has consented to data collection before processing
 */

const consentService = require('../services/consent.service');
const logger = require('../utils/logger');

/**
 * Middleware to check research consent before data collection
 */
function checkResearchConsent(req, res, next) {
  // This middleware can be used to gate data collection endpoints
  // For now, it's a placeholder that can be enhanced
  next();
}

/**
 * Middleware to log data collection (respects consent)
 */
async function logDataCollection(req, res, next) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return next();
    }

    // Check if user has consented to research
    const hasConsent = await consentService.hasActiveConsent(userId, 'research');
    
    if (!hasConsent) {
      // Don't log data for users without consent
      logger.debug('Skipping data collection - no consent', { userId });
      return next();
    }

    // Log data collection (this would be used for research data)
    // For now, just pass through
    next();
  } catch (error) {
    logger.error('Error checking consent for data collection', error);
    // Don't block request on consent check error
    next();
  }
}

module.exports = {
  checkResearchConsent,
  logDataCollection
};

