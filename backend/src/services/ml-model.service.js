/**
 * ML Model Service
 * Loads and manages ML models for inference
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

// Model cache
const modelCache = new Map();

/**
 * Model types
 */
const MODEL_TYPES = {
  SAFETY_CLASSIFIER: 'safety_classifier',
  INTENT_CLASSIFIER: 'intent_classifier',
  PERSONA_MODEL: 'persona_model'
};

/**
 * Model configuration
 */
const MODEL_CONFIG = {
  models_dir: process.env.MODELS_DIR || path.join(__dirname, '../../ml/models'),
  cache_enabled: process.env.MODEL_CACHE_ENABLED !== 'false',
  default_version: 'latest'
};

/**
 * Load model metadata
 */
async function loadModelMetadata(modelType, version = 'latest') {
  const modelPath = path.join(MODEL_CONFIG.models_dir, modelType, version);
  const metadataPath = path.join(modelPath, 'metadata.json');
  
  try {
    const metadataContent = await fs.readFile(metadataPath, 'utf8');
    return JSON.parse(metadataContent);
  } catch (error) {
    logger.warn(`Model metadata not found: ${metadataPath}`, { modelType, version });
    return null;
  }
}

/**
 * Load model (placeholder - actual implementation depends on model format)
 */
async function loadModel(modelType, version = 'latest') {
  const cacheKey = `${modelType}:${version}`;
  
  // Check cache
  if (MODEL_CONFIG.cache_enabled && modelCache.has(cacheKey)) {
    logger.debug(`Model loaded from cache: ${cacheKey}`);
    return modelCache.get(cacheKey);
  }
  
  const modelPath = path.join(MODEL_CONFIG.models_dir, modelType, version);
  
  try {
    // Check if model exists
    await fs.access(modelPath);
    
    // Load model based on type
    let model;
    
    if (modelType === MODEL_TYPES.SAFETY_CLASSIFIER) {
      // Load safety classifier (BERT-based)
      // In production, use ONNX Runtime or TensorFlow.js
      model = await loadSafetyClassifier(modelPath);
    } else if (modelType === MODEL_TYPES.INTENT_CLASSIFIER) {
      // Load intent classifier
      model = await loadIntentClassifier(modelPath);
    } else {
      throw new Error(`Unknown model type: ${modelType}`);
    }
    
    // Cache model
    if (MODEL_CONFIG.cache_enabled) {
      modelCache.set(cacheKey, model);
    }
    
    logger.info(`Model loaded: ${modelType} v${version}`);
    return model;
  } catch (error) {
    logger.error(`Failed to load model: ${modelType} v${version}`, error);
    throw error;
  }
}

/**
 * Load safety classifier model
 */
async function loadSafetyClassifier(modelPath) {
  // Placeholder for actual model loading
  // In production, this would load ONNX or TensorFlow.js model
  
  const metadata = await loadModelMetadata(MODEL_TYPES.SAFETY_CLASSIFIER);
  
  return {
    type: MODEL_TYPES.SAFETY_CLASSIFIER,
    path: modelPath,
    metadata,
    predict: async (text) => {
      // Placeholder - actual inference would happen here
      // For now, fall back to rule-based safety service
      logger.warn('ML model not available, using rule-based fallback');
      return null;
    }
  };
}

/**
 * Load intent classifier model
 */
async function loadIntentClassifier(modelPath) {
  const metadata = await loadModelMetadata(MODEL_TYPES.INTENT_CLASSIFIER);
  
  return {
    type: MODEL_TYPES.INTENT_CLASSIFIER,
    path: modelPath,
    metadata,
    predict: async (text) => {
      // Placeholder - actual inference would happen here
      logger.warn('ML model not available, using rule-based fallback');
      return null;
    }
  };
}

/**
 * Get model version info
 */
async function getModelVersion(modelType, environment = 'production') {
  try {
    const registryPath = path.join(MODEL_CONFIG.models_dir, 'registry.json');
    const registryContent = await fs.readFile(registryPath, 'utf8');
    const registry = JSON.parse(registryContent);
    
    if (registry.deployments && registry.deployments[modelType]) {
      return registry.deployments[modelType][environment]?.version || 'latest';
    }
    
    return 'latest';
  } catch (error) {
    logger.warn('Model registry not found, using latest', { modelType });
    return 'latest';
  }
}

/**
 * Check if model is available
 */
async function isModelAvailable(modelType, version = 'latest') {
  try {
    const modelPath = path.join(MODEL_CONFIG.models_dir, modelType, version);
    await fs.access(modelPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * List available models
 */
async function listAvailableModels() {
  const models = {};
  
  try {
    const modelsDir = MODEL_CONFIG.models_dir;
    const entries = await fs.readdir(modelsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const modelType = entry.name;
        const typePath = path.join(modelsDir, modelType);
        const versions = await fs.readdir(typePath, { withFileTypes: true });
        
        models[modelType] = versions
          .filter(v => v.isDirectory())
          .map(v => v.name);
      }
    }
  } catch (error) {
    logger.warn('Failed to list models', error);
  }
  
  return models;
}

/**
 * Clear model cache
 */
function clearModelCache() {
  modelCache.clear();
  logger.info('Model cache cleared');
}

module.exports = {
  loadModel,
  loadModelMetadata,
  getModelVersion,
  isModelAvailable,
  listAvailableModels,
  clearModelCache,
  MODEL_TYPES,
  MODEL_CONFIG
};

