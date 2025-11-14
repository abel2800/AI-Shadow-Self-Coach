/**
 * Consent Controller
 * Handles consent management endpoints
 */

const consentService = require('../services/consent.service');
const { User } = require('../models');

/**
 * Get current consent status
 */
exports.getConsentStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const consentType = req.query.type || 'research';

    const status = await consentService.getConsentStatus(userId, consentType);
    const needsRenewal = await consentService.needsConsentRenewal(userId);

    res.status(200).json({
      ...status,
      needs_renewal: needsRenewal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update consent
 */
exports.updateConsent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { consent_type, granted, consent_text, version } = req.body;

    // Validate
    if (typeof granted !== 'boolean') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'granted must be a boolean'
        }
      });
    }

    // Get request info for audit
    const requestInfo = {
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent'),
      metadata: {
        updated_via: 'api'
      }
    };

    const consent = await consentService.updateConsent(
      userId,
      {
        consent_type: consent_type || 'research',
        granted,
        consent_text,
        version: version || '1.0'
      },
      requestInfo
    );

    res.status(200).json({
      consent_id: consent.id,
      consent_type: consent.consent_type,
      granted: consent.granted,
      version: consent.version,
      updated_at: consent.created_at
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get consent history
 */
exports.getConsentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const consentType = req.query.type || null;

    const history = await consentService.getConsentHistory(userId, consentType);

    res.status(200).json({
      history,
      total_records: history.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke consent
 */
exports.revokeConsent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const consentType = req.query.type || 'research';

    const requestInfo = {
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent'),
      metadata: {
        action: 'revoked',
        updated_via: 'api'
      }
    };

    const consent = await consentService.revokeConsent(userId, consentType, requestInfo);

    res.status(200).json({
      consent_id: consent.id,
      consent_type: consent.consent_type,
      granted: false,
      revoked_at: consent.created_at,
      message: 'Consent revoked successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get consent statistics (admin only)
 */
exports.getConsentStatistics = async (req, res, next) => {
  try {
    // Admin check is handled by requireAdmin middleware
    const consentType = req.query.type || 'research';

    const stats = await consentService.getConsentStatistics(consentType);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

