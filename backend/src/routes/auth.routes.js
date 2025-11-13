const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate, schemas } = require('../middleware/validation.middleware');
const { authLimiter } = require('../utils/rateLimiter');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: secure_password_123
 *               consent_for_research:
 *                 type: boolean
 *                 default: false
 *               preferences:
 *                 type: object
 *                 properties:
 *                   session_length:
 *                     type: string
 *                     enum: [short, medium, long]
 *                   notifications_enabled:
 *                     type: boolean
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                 token:
 *                   type: string
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: Email already registered
 */
router.post('/register', authLimiter, validate(schemas.register), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                 token:
 *                   type: string
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, validate(schemas.login), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired token
 */
router.post('/refresh', authController.refresh);

module.exports = router;

