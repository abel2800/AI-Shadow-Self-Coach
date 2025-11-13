/**
 * Health Check Routes
 * System health and status endpoints
 */

const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                     openai:
 *                       type: string
 *       503:
 *         description: Service is unhealthy
 */
router.get('/', healthController.health);

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check with service metrics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                 version:
 *                   type: string
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         latency_ms:
 *                           type: integer
 *                     openai:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                 uptime:
 *                   type: number
 *       503:
 *         description: Service is unhealthy
 */
router.get('/detailed', healthController.healthDetailed);

module.exports = router;

