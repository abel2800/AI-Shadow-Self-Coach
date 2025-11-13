const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');
const { sessionLimiter } = require('../utils/rateLimiter');

// All session routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /session/start:
 *   post:
 *     summary: Start a new coaching session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - session_type
 *             properties:
 *               session_type:
 *                 type: string
 *                 enum: [check-in, gentle_deep, micro_practice]
 *               mood_score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               initial_message:
 *                 type: string
 *               consent_for_deep_exploration:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Session started successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/start', sessionLimiter, validate(schemas.startSession), sessionController.startSession);

/**
 * @swagger
 * /session/{id}/message:
 *   post:
 *     summary: Send a message in a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message_text
 *             properties:
 *               message_text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5000
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Message sent and response generated
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.post('/:id/message', validate(schemas.sendMessage), sessionController.sendMessage);

// Pause a session
router.post('/:id/pause', sessionController.pauseSession);

// Resume a session
router.post('/:id/resume', sessionController.resumeSession);

// End a session
router.post('/:id/end', sessionController.endSession);

// Get session summary
router.get('/:id/summary', sessionController.getSessionSummary);

// List user's sessions
router.get('/', sessionController.listSessions);

module.exports = router;

