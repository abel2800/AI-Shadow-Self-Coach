const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');

// All admin routes require authentication and admin privileges
router.use(authMiddleware);
router.use(requireAdmin);

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get system statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 */
router.get('/stats', adminController.getSystemStats);

/**
 * @swagger
 * /api/v1/admin/beta-feedback:
 *   get:
 *     summary: Get beta feedback list (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: feedback_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Beta feedback list
 */
router.get('/beta-feedback', adminController.getBetaFeedback);

/**
 * @swagger
 * /api/v1/admin/beta-feedback/:feedback_id:
 *   put:
 *     summary: Update beta feedback (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *               response:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback updated
 */
router.put('/beta-feedback/:feedback_id', adminController.updateBetaFeedback);

/**
 * @swagger
 * /api/v1/admin/beta-testers/stats:
 *   get:
 *     summary: Get beta tester statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Beta tester statistics
 */
router.get('/beta-testers/stats', adminController.getBetaTesterStats);

/**
 * @swagger
 * /api/v1/admin/safety/stats:
 *   get:
 *     summary: Get safety statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Safety statistics
 */
router.get('/safety/stats', adminController.getSafetyStats);

/**
 * @swagger
 * /api/v1/admin/users/activity:
 *   get:
 *     summary: Get user activity statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: User activity statistics
 */
router.get('/users/activity', adminController.getUserActivityStats);

module.exports = router;

