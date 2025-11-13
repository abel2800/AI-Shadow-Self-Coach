/**
 * ML Model Management Routes
 * Admin routes for model deployment and management
 */

const express = require('express');
const router = express.Router();
const mlModelService = require('../services/ml-model.service');
const authMiddleware = require('../middleware/auth.middleware');
const logger = require('../utils/logger');

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /ml-models:
 *   get:
 *     summary: List available ML models
 *     tags: [ML Models]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available models
 */
router.get('/', async (req, res, next) => {
  try {
    const models = await mlModelService.listAvailableModels();
    res.status(200).json({
      models,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /ml-models/{type}:
 *   get:
 *     summary: Get model information
 *     tags: [ML Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [safety_classifier, intent_classifier, persona_model]
 *     responses:
 *       200:
 *         description: Model information
 */
router.get('/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const version = req.query.version || 'latest';
    
    const metadata = await mlModelService.loadModelMetadata(type, version);
    const isAvailable = await mlModelService.isModelAvailable(type, version);
    const deployedVersion = await mlModelService.getModelVersion(type);
    
    res.status(200).json({
      model_type: type,
      version,
      deployed_version: deployedVersion,
      available: isAvailable,
      metadata
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /ml-models/{type}/health:
 *   get:
 *     summary: Check model health
 *     tags: [ML Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Model health status
 */
router.get('/:type/health', async (req, res, next) => {
  try {
    const { type } = req.params;
    const version = req.query.version || 'latest';
    
    const isAvailable = await mlModelService.isModelAvailable(type, version);
    const metadata = await mlModelService.loadModelMetadata(type, version);
    
    // Try to load model to verify it works
    let loadable = false;
    try {
      await mlModelService.loadModel(type, version);
      loadable = true;
    } catch (error) {
      logger.warn(`Model health check failed: ${type}`, error);
    }
    
    res.status(200).json({
      model_type: type,
      version,
      status: isAvailable && loadable ? 'healthy' : 'unavailable',
      available: isAvailable,
      loadable,
      metadata: metadata ? {
        version: metadata.version,
        deployed_at: metadata.deployed_at
      } : null
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

