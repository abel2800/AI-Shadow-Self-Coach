/**
 * Consent Service
 * Manages user consent for research data collection
 */

const { Consent, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Get current consent status for a user
 */
async function getConsentStatus(userId, consentType = 'research') {
  try {
    // Get latest consent record
    const latestConsent = await Consent.findOne({
      where: {
        user_id: userId,
        consent_type: consentType
      },
      order: [['created_at', 'DESC']]
    });

    if (!latestConsent) {
      return {
        has_consent: false,
        granted: false,
        last_updated: null,
        version: null
      };
    }

    return {
      has_consent: true,
      granted: latestConsent.granted,
      last_updated: latestConsent.created_at,
      version: latestConsent.version,
      consent_id: latestConsent.id
    };
  } catch (error) {
    logger.error('Failed to get consent status', error);
    throw error;
  }
}

/**
 * Update user consent
 */
async function updateConsent(userId, consentData, requestInfo = {}) {
  try {
    const {
      consent_type = 'research',
      granted,
      consent_text,
      version = '1.0'
    } = consentData;

    // Validate
    if (typeof granted !== 'boolean') {
      throw new Error('granted must be a boolean');
    }

    // Create consent record
    const consent = await Consent.create({
      id: uuidv4(),
      user_id: userId,
      consent_type,
      granted,
      consent_text: consent_text || null,
      version,
      ip_address: requestInfo.ip_address || null,
      user_agent: requestInfo.user_agent || null,
      metadata: requestInfo.metadata || {}
    });

    // Update user's consent_for_research field (for backward compatibility)
    if (consent_type === 'research') {
      await User.update(
        { consent_for_research: granted },
        { where: { id: userId } }
      );
    }

    logger.info('Consent updated', {
      userId,
      consent_type,
      granted,
      consent_id: consent.id
    });

    return consent;
  } catch (error) {
    logger.error('Failed to update consent', error);
    throw error;
  }
}

/**
 * Get consent history for a user
 */
async function getConsentHistory(userId, consentType = null) {
  try {
    const where = { user_id: userId };
    if (consentType) {
      where.consent_type = consentType;
    }

    const consents = await Consent.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    return consents.map(consent => ({
      consent_id: consent.id,
      consent_type: consent.consent_type,
      granted: consent.granted,
      version: consent.version,
      created_at: consent.created_at,
      ip_address: consent.ip_address
    }));
  } catch (error) {
    logger.error('Failed to get consent history', error);
    throw error;
  }
}

/**
 * Check if user has active consent
 */
async function hasActiveConsent(userId, consentType = 'research') {
  try {
    const status = await getConsentStatus(userId, consentType);
    return status.granted === true;
  } catch (error) {
    logger.error('Failed to check active consent', error);
    return false; // Default to no consent on error
  }
}

/**
 * Revoke consent
 */
async function revokeConsent(userId, consentType = 'research', requestInfo = {}) {
  try {
    return await updateConsent(
      userId,
      {
        consent_type: consentType,
        granted: false,
        version: '1.0' // Use current version
      },
      {
        ...requestInfo,
        metadata: {
          ...requestInfo.metadata,
          action: 'revoked'
        }
      }
    );
  } catch (error) {
    logger.error('Failed to revoke consent', error);
    throw error;
  }
}

/**
 * Get consent statistics (for admin/analytics)
 */
async function getConsentStatistics(consentType = 'research') {
  try {
    // Get total users
    const totalUsers = await User.count();

    // Get users with active consent
    const activeConsents = await Consent.findAll({
      where: {
        consent_type: consentType,
        granted: true
      },
      attributes: ['user_id'],
      group: ['user_id'],
      raw: true
    });

    const usersWithConsent = activeConsents.length;

    // Get consent rate over time
    const { sequelize } = require('../config/database');
    const consentsByDate = await Consent.findAll({
      where: {
        consent_type: consentType
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.cast(sequelize.col('granted'), 'INTEGER')), 'granted_count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'DESC']],
      limit: 30, // Last 30 days
      raw: true
    });

    return {
      total_users: totalUsers,
      users_with_consent: usersWithConsent,
      consent_rate: totalUsers > 0 ? (usersWithConsent / totalUsers) * 100 : 0,
      recent_trends: consentsByDate
    };
  } catch (error) {
    logger.error('Failed to get consent statistics', error);
    throw error;
  }
}

/**
 * Check if consent needs renewal (e.g., policy updated)
 */
async function needsConsentRenewal(userId, currentVersion = '1.0') {
  try {
    const status = await getConsentStatus(userId);
    
    if (!status.has_consent) {
      return true; // No consent yet
    }

    if (status.version !== currentVersion) {
      return true; // Policy version changed
    }

    // Check if consent is older than 1 year (optional renewal)
    if (status.last_updated) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (new Date(status.last_updated) < oneYearAgo) {
        return true; // Consent is older than 1 year
      }
    }

    return false;
  } catch (error) {
    logger.error('Failed to check consent renewal', error);
    return true; // Default to needing renewal on error
  }
}

module.exports = {
  getConsentStatus,
  updateConsent,
  getConsentHistory,
  hasActiveConsent,
  revokeConsent,
  getConsentStatistics,
  needsConsentRenewal
};

