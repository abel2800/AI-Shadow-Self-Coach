const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');

// All analytics routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /analytics/mood:
 *   post:
 *     summary: Submit a mood score
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mood_score
 *             properties:
 *               mood_score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Mood score from 1 (very low) to 10 (very high)
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Mood score recorded successfully
 *       400:
 *         description: Invalid mood score
 */
router.post('/mood', validate(schemas.submitMood), analyticsController.submitMood);

/**
 * @swagger
 * /analytics/mood:
 *   get:
 *     summary: Get mood history
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for mood history
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for mood history
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *     responses:
 *       200:
 *         description: Mood history retrieved successfully
 */
router.get('/mood', analyticsController.getMoodHistory);

// Get insights analytics
router.get('/insights', analyticsController.getInsights);

// Get overall progress
router.get('/progress', analyticsController.getProgress);

module.exports = router;

