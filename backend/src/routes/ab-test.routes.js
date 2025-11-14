/**
 * A/B Test Routes
 * Admin routes for A/B test management
 */

const express = require('express');
const router = express.Router();
const abTestController = require('../controllers/ab-test.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');
const Joi = require('joi');

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /ab-tests:
 *   post:
 *     summary: Create a new A/B test
 *     tags: [A/B Testing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - model_type
 *               - variant_a
 *               - variant_b
 *             properties:
 *               name:
 *                 type: string
 *               model_type:
 *                 type: string
 *                 enum: [safety_classifier, intent_classifier, persona_model]
 *               variant_a:
 *                 type: string
 *               variant_b:
 *                 type: string
 *               traffic_split:
 *                 type: object
 *     responses:
 *       201:
 *         description: A/B test created
 */
const createTestSchema = Joi.object({
  name: Joi.string().required(),
  model_type: Joi.string().valid('safety_classifier', 'intent_classifier', 'persona_model').required(),
  variant_a: Joi.string().required(),
  variant_b: Joi.string().required(),
  traffic_split: Joi.object({
    a: Joi.number().min(0).max(1).required(),
    b: Joi.number().min(0).max(1).required()
  }).optional(),
  criteria: Joi.object().optional(),
  metadata: Joi.object().optional()
});

router.post(
  '/',
  validationMiddleware(createTestSchema),
  abTestController.createTest
);

/**
 * @swagger
 * /ab-tests:
 *   get:
 *     summary: List all A/B tests
 *     tags: [A/B Testing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: model_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of A/B tests
 */
router.get('/', abTestController.listTests);

/**
 * @swagger
 * /ab-tests/{id}:
 *   get:
 *     summary: Get A/B test by ID
 *     tags: [A/B Testing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A/B test details
 */
router.get('/:id', abTestController.getTest);

/**
 * @swagger
 * /ab-tests/{id}/start:
 *   post:
 *     summary: Start an A/B test
 *     tags: [A/B Testing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test started
 */
router.post('/:id/start', abTestController.startTest);

/**
 * @swagger
 * /ab-tests/{id}/pause:
 *   post:
 *     summary: Pause an A/B test
 *     tags: [A/B Testing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test paused
 */
router.post('/:id/pause', abTestController.pauseTest);

/**
 * @swagger
 * /ab-tests/{id}/complete:
 *   post:
 *     summary: Complete an A/B test
 *     tags: [A/B Testing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               winner:
 *                 type: string
 *                 enum: [a, b]
 *     responses:
 *       200:
 *         description: Test completed
 */
router.post('/:id/complete', abTestController.completeTest);

/**
 * @swagger
 * /ab-tests/user/variant:
 *   get:
 *     summary: Get user's assigned variant for a model type
 *     tags: [A/B Testing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: model_type
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's variant assignment
 */
router.get('/user/variant', abTestController.getUserVariant);

module.exports = router;

