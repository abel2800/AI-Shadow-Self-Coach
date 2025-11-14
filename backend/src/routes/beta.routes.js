const express = require('express');
const router = express.Router();
const betaController = require('../controllers/beta.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/beta/enroll:
 *   post:
 *     summary: Enroll in beta testing
 *     tags: [Beta Testing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cohort:
 *                 type: string
 *                 default: general
 *               feedback_consent:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Successfully enrolled
 *       400:
 *         description: Already enrolled
 */
router.post('/enroll', betaController.enrollBetaTester);

/**
 * @swagger
 * /api/v1/beta/status:
 *   get:
 *     summary: Get beta tester status
 *     tags: [Beta Testing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Beta tester status
 *       404:
 *         description: Not enrolled
 */
router.get('/status', betaController.getBetaTesterStatus);

/**
 * @swagger
 * /api/v1/beta/feedback:
 *   post:
 *     summary: Submit beta feedback
 *     tags: [Beta Testing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               feedback_type:
 *                 type: string
 *                 enum: [survey, bug_report, feature_request, general, session_feedback]
 *               category:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Feedback submitted
 */
router.post('/feedback', betaController.submitFeedback);

/**
 * @swagger
 * /api/v1/beta/feedback:
 *   get:
 *     summary: Get feedback history
 *     tags: [Beta Testing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: feedback_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedback history
 */
router.get('/feedback', betaController.getFeedbackHistory);

/**
 * @swagger
 * /api/v1/beta/consent:
 *   put:
 *     summary: Update feedback consent
 *     tags: [Beta Testing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedback_consent
 *             properties:
 *               feedback_consent:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Consent updated
 */
router.put('/consent', betaController.updateFeedbackConsent);

/**
 * @swagger
 * /api/v1/beta/withdraw:
 *   post:
 *     summary: Withdraw from beta testing
 *     tags: [Beta Testing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully withdrawn
 */
router.post('/withdraw', betaController.withdrawFromBeta);

module.exports = router;

