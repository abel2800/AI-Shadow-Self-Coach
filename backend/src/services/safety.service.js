// Safety service for risk detection
// Uses trained ML model when available, falls back to rule-based detection

const mlModelService = require('./ml-model.service');
const logger = require('../utils/logger');

// Risk level mapping
const RISK_LEVELS = ['none', 'low', 'medium', 'high'];
const RISK_LEVEL_MAP = {
  0: 'none',
  1: 'low',
  2: 'medium',
  3: 'high'
};

/**
 * Check risk level of user message
 * Tries ML model first, falls back to rule-based detection
 */
async function checkRisk(message) {
  try {
    // Try to use ML model if available
    const useMLModel = process.env.USE_ML_SAFETY_CLASSIFIER !== 'false';
    
    if (useMLModel) {
      try {
        const modelAvailable = await mlModelService.isModelAvailable(
          mlModelService.MODEL_TYPES.SAFETY_CLASSIFIER
        );
        
        if (modelAvailable) {
          const model = await mlModelService.loadModel(
            mlModelService.MODEL_TYPES.SAFETY_CLASSIFIER
          );
          
          if (model && model.predict) {
            const prediction = await model.predict(message);
            
            if (prediction && prediction.risk_level) {
              logger.debug('Safety check using ML model', {
                risk_level: prediction.risk_level,
                confidence: prediction.confidence
              });
              
              return {
                risk_level: prediction.risk_level,
                confidence: prediction.confidence || 0.9,
                category: prediction.category || 'unknown',
                urgency: getUrgencyFromRiskLevel(prediction.risk_level),
                method: 'ml_model',
                model_version: model.metadata?.version || 'unknown'
              };
            }
          }
        }
      } catch (error) {
        logger.warn('ML model safety check failed, falling back to rule-based', {
          error: error.message
        });
      }
    }
    
    // Fall back to rule-based detection
    return ruleBasedRiskCheck(message);
  } catch (error) {
    logger.error('Safety check error, using rule-based fallback', error);
    return ruleBasedRiskCheck(message);
  }
}

/**
 * Rule-based risk detection (fallback)
 */
function ruleBasedRiskCheck(message) {
  const lowerMessage = message.toLowerCase();

  // High-risk keywords (suicidal ideation, self-harm)
  const highRiskPatterns = [
    'kill myself',
    'end my life',
    'suicide',
    'want to die',
    'hurt myself',
    'cut myself',
    'self harm',
    'no reason to live',
    'going to kill',
    'planning to die'
  ];

  // Medium-risk keywords
  const mediumRiskPatterns = [
    'hopeless',
    'no point',
    'give up',
    'can\'t go on',
    'nothing matters',
    'life is worthless',
    'better off dead'
  ];

  // Check for high-risk
  for (const pattern of highRiskPatterns) {
    if (lowerMessage.includes(pattern)) {
      return {
        risk_level: 'high',
        confidence: 0.95,
        category: 'suicidal_ideation',
        urgency: 'immediate',
        method: 'rule_based'
      };
    }
  }

  // Check for medium-risk
  for (const pattern of mediumRiskPatterns) {
    if (lowerMessage.includes(pattern)) {
      return {
        risk_level: 'medium',
        confidence: 0.75,
        category: 'distress',
        urgency: 'moderate',
        method: 'rule_based'
      };
    }
  }

  // Check for negative sentiment
  const negativeWords = ['sad', 'depressed', 'anxious', 'worried', 'scared', 'afraid', 'lonely', 'empty'];
  const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
  
  if (negativeCount >= 2) {
    return {
      risk_level: 'low',
      confidence: 0.6,
      category: 'negative_sentiment',
      urgency: 'low',
      method: 'rule_based'
    };
  }

  return {
    risk_level: 'none',
    confidence: 0.9,
    category: 'safe',
    urgency: 'none',
    method: 'rule_based'
  };
}

/**
 * Get urgency level from risk level
 */
function getUrgencyFromRiskLevel(riskLevel) {
  const urgencyMap = {
    'none': 'none',
    'low': 'low',
    'medium': 'moderate',
    'high': 'immediate'
  };
  return urgencyMap[riskLevel] || 'none';
}

/**
 * Check if ML model is available and enabled
 */
async function isMLModelAvailable() {
  try {
    return await mlModelService.isModelAvailable(
      mlModelService.MODEL_TYPES.SAFETY_CLASSIFIER
    ) && process.env.USE_ML_SAFETY_CLASSIFIER !== 'false';
  } catch (error) {
    return false;
  }
}

module.exports = {
  checkRisk,
  isMLModelAvailable,
  ruleBasedRiskCheck // Exported for testing
};

