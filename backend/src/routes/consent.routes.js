/**
 * Consent Routes
 * Routes for managing user consent
 */

const express = require('express');
const router = express.Router();
const consentController = require('../controllers/consent.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const Joi = require('joi');

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /consent:
 *   get:
 *     summary: Get current consent status
 *     tags: [Consent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [research, data_processing, analytics, third_party]
 *     responses:
 *       200:
 *         description: Consent status
 */
router.get('/', consentController.getConsentStatus);

/**
 * @swagger
 * /consent:
 *   post:
 *     summary: Update consent
 *     tags: [Consent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - granted
 *             properties:
 *               consent_type:
 *                 type: string
 *                 enum: [research, data_processing, analytics, third_party]
 *               granted:
 *                 type: boolean
 *               consent_text:
 *                 type: string
 *               version:
 *                 type: string
 *     responses:
 *       200:
 *         description: Consent updated
 */
const updateConsentSchema = Joi.object({
  consent_type: Joi.string().valid('research', 'data_processing', 'analytics', 'third_party').default('research'),
  granted: Joi.boolean().required(),
  consent_text: Joi.string().optional(),
  version: Joi.string().default('1.0')
});

router.post(
  '/',
  validationMiddleware(updateConsentSchema),
  consentController.updateConsent
);

/**
 * @swagger
 * /consent/history:
 *   get:
 *     summary: Get consent history
 *     tags: [Consent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Consent history
 */
router.get('/history', consentController.getConsentHistory);

/**
 * @swagger
 * /consent/revoke:
 *   post:
 *     summary: Revoke consent
 *     tags: [Consent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Consent revoked
 */
router.post('/revoke', consentController.revokeConsent);

/**
 * @swagger
 * /consent/statistics:
 *   get:
 *     summary: Get consent statistics (admin)
 *     tags: [Consent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Consent statistics
 */
router.get('/statistics', authMiddleware, requireAdmin, consentController.getConsentStatistics);

module.exports = router;

