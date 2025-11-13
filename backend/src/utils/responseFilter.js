/**
 * Response Filter with Hard Constraints
 * Enforces safety, therapeutic boundaries, and persona consistency
 * 
 * Hard Constraints:
 * - No medical/diagnostic advice
 * - No legal advice
 * - No encouragement of risky behavior
 * - Required safety prompts for high-risk situations
 * - Therapeutic boundary enforcement
 * - Persona consistency checks
 */

const logger = require('./logger');

/**
 * Unsafe patterns that trigger content replacement
 */
const UNSAFE_PATTERNS = [
  // Self-harm encouragement
  /you should (kill|hurt|harm|end|die)/i,
  /you need to (kill|hurt|harm|end|die)/i,
  /you must (kill|hurt|harm|end|die)/i,
  /(try|attempt) to (kill|hurt|harm|end|die)/i,
  
  // Medical/diagnostic advice
  /you have (depression|anxiety|bipolar|ptsd|ocd|adhd|autism|schizophrenia)/i,
  /you are (depressed|anxious|bipolar|diagnosed)/i,
  /you need (medication|prescription|drugs|pills)/i,
  /you should (take|use|try) (medication|prescription|drugs|pills)/i,
  /medical advice:/i,
  /diagnosis:/i,
  /you have a (disorder|condition|illness|disease)/i,
  /clinical (diagnosis|assessment|evaluation)/i,
  
  // Legal advice
  /legal advice:/i,
  /you should (sue|file|litigate|prosecute)/i,
  /you need a (lawyer|attorney|counsel)/i,
  /legal (action|proceedings|matter)/i,
  
  // Reckless behavior encouragement
  /you should (quit|leave|abandon) (your job|work|school|family)/i,
  /you need to (quit|leave|abandon) (everything|all of it)/i,
  /just (give up|walk away|ignore)/i,
  
  // Substance abuse encouragement
  /you should (drink|use drugs|smoke|get high)/i,
  /(alcohol|drugs|substances) will help/i,
  
  // Dangerous activities
  /you should (drive|operate) (while|when) (drunk|intoxicated|high)/i,
  /(ignore|disregard) (safety|warnings|precautions)/i,
  
  // Invalidating language
  /(just|simply) (get over|move on|forget about) it/i,
  /(stop|don't) (being|feeling) (sad|depressed|anxious)/i,
  /you're (overreacting|being dramatic|too sensitive)/i,
  
  // Boundary violations
  /I (can|will) (fix|cure|solve) (you|your problems)/i,
  /I (guarantee|promise) (you'll|it will) (get better|be fine)/i,
];

/**
 * Diagnostic language patterns (soft block - replace with boundary message)
 */
const DIAGNOSTIC_PATTERNS = [
  /you (have|suffer from|are experiencing) (symptoms of|signs of)/i,
  /this (sounds like|looks like|seems like) (depression|anxiety|ptsd)/i,
  /you (may|might|probably) have/i,
  /based on (what you've|your) (described|said|told me)/i,
];

/**
 * Required phrases for different risk levels
 */
const REQUIRED_PHRASES = {
  high: [
    "concerned about your safety",
    "safe right now",
    "crisis",
    "988",
    "741741",
    "crisis resources"
  ],
  medium: [
    "support",
    "help",
    "difficult"
  ]
};

/**
 * Validation phrases (compassionate acknowledgment)
 */
const VALIDATION_PHRASES = [
  "it's okay",
  "that sounds",
  "I'm sorry",
  "that must feel",
  "I understand",
  "I hear you",
  "that makes sense",
  "I can see",
  "that's valid"
];

/**
 * Therapeutic boundary messages
 */
const BOUNDARY_MESSAGES = {
  medical: "I can't provide medical advice or diagnoses. If you're concerned about your mental or physical health, please consult with a licensed healthcare provider.",
  legal: "I can't provide legal advice. For legal matters, please consult with a qualified attorney.",
  diagnostic: "I'm not qualified to diagnose. If you're experiencing concerning symptoms, please speak with a healthcare professional.",
  general: "I can't provide advice on that. Would you like to explore what's underneath that feeling instead?"
};

/**
 * Safety prompts for different risk levels
 */
const SAFETY_PROMPTS = {
  high: "\n\nI'm concerned about your safety. Are you safe right now? If you're in crisis, please contact 988 (Suicide & Crisis Lifeline) or text HOME to 741741 (Crisis Text Line). You're not alone, and there are people who want to help.",
  medium: "\n\nI want to make sure you have support. If you're struggling, consider reaching out to a trusted friend, family member, or mental health professional."
};

/**
 * Filter response with hard constraints
 * 
 * @param {string} responseText - The AI-generated response text
 * @param {string} riskLevel - Risk level: 'none', 'low', 'medium', 'high'
 * @param {string} intent - Therapeutic intent classification
 * @param {object} options - Additional options
 * @returns {object} Filtered response with metadata
 */
function filter(responseText, riskLevel = 'none', intent = null, options = {}) {
  const originalText = responseText;
  let filteredText = responseText;
  const violations = [];
  const actions = [];

  // 1. Check for unsafe patterns (hard block)
  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(filteredText)) {
      violations.push({
        type: 'unsafe_pattern',
        pattern: pattern.toString(),
        severity: 'high'
      });
      
      // Determine replacement message based on pattern type
      if (pattern.source.includes('medical') || pattern.source.includes('diagnosis')) {
        filteredText = BOUNDARY_MESSAGES.medical;
        actions.push('replaced_medical_advice');
      } else if (pattern.source.includes('legal')) {
        filteredText = BOUNDARY_MESSAGES.legal;
        actions.push('replaced_legal_advice');
      } else {
        filteredText = BOUNDARY_MESSAGES.general;
        actions.push('replaced_unsafe_content');
      }
      
      logger.warn('Response filter: Unsafe pattern detected', {
        pattern: pattern.toString(),
        riskLevel,
        intent,
        originalLength: originalText.length
      });
      break; // Stop after first violation
    }
  }

  // 2. Check for diagnostic language (soft block)
  if (filteredText === originalText) { // Only if not already replaced
    for (const pattern of DIAGNOSTIC_PATTERNS) {
      if (pattern.test(filteredText)) {
        violations.push({
          type: 'diagnostic_language',
          pattern: pattern.toString(),
          severity: 'medium'
        });
        
        filteredText = BOUNDARY_MESSAGES.diagnostic;
        actions.push('replaced_diagnostic_language');
        
        logger.warn('Response filter: Diagnostic language detected', {
          pattern: pattern.toString(),
          riskLevel,
          intent
        });
        break;
      }
    }
  }

  // 3. Enforce required safety prompts for high-risk
  if (riskLevel === 'high') {
    const hasRequiredPhrases = REQUIRED_PHRASES.high.some(phrase => 
      filteredText.toLowerCase().includes(phrase.toLowerCase())
    );
    
    if (!hasRequiredPhrases) {
      filteredText += SAFETY_PROMPTS.high;
      actions.push('added_high_risk_prompt');
      
      logger.info('Response filter: Added high-risk safety prompt', {
        riskLevel,
        intent
      });
    }
  }

  // 4. Add medium-risk support prompts
  if (riskLevel === 'medium') {
    const hasSupportPhrases = REQUIRED_PHRASES.medium.some(phrase =>
      filteredText.toLowerCase().includes(phrase.toLowerCase())
    );
    
    if (!hasSupportPhrases && !filteredText.includes('support')) {
      filteredText += SAFETY_PROMPTS.medium;
      actions.push('added_medium_risk_prompt');
    }
  }

  // 5. Ensure validation for exploratory intents
  const exploratoryIntents = ['validate', 'probe_story', 'probe_root', 'explore'];
  if (intent && exploratoryIntents.includes(intent)) {
    const hasValidation = VALIDATION_PHRASES.some(phrase =>
      filteredText.toLowerCase().includes(phrase.toLowerCase())
    );
    
    if (!hasValidation) {
      filteredText = addValidation(filteredText);
      actions.push('added_validation');
    }
  }

  // 6. Check response length (prevent overly long responses)
  const maxLength = options.maxLength || 2000;
  if (filteredText.length > maxLength) {
    // Truncate but preserve safety prompts
    if (filteredText.includes(SAFETY_PROMPTS.high)) {
      const mainText = filteredText.replace(SAFETY_PROMPTS.high, '');
      filteredText = mainText.substring(0, maxLength - SAFETY_PROMPTS.high.length) + '...' + SAFETY_PROMPTS.high;
    } else {
      filteredText = filteredText.substring(0, maxLength) + '...';
    }
    actions.push('truncated_length');
  }

  // 7. Ensure minimum response quality
  if (filteredText.length < 20 && filteredText === originalText) {
    // If response is too short and wasn't filtered, add validation
    filteredText = addValidation(filteredText);
    actions.push('enhanced_short_response');
  }

  // Log filtering actions if any
  if (actions.length > 0 || violations.length > 0) {
    logger.info('Response filter applied', {
      actions,
      violations: violations.length,
      riskLevel,
      intent,
      originalLength: originalText.length,
      filteredLength: filteredText.length,
      wasModified: filteredText !== originalText
    });
  }

  return {
    text: filteredText,
    wasFiltered: filteredText !== originalText,
    violations,
    actions,
    metadata: {
      originalLength: originalText.length,
      filteredLength: filteredText.length,
      riskLevel,
      intent
    }
  };
}

/**
 * Replace unsafe content with boundary message
 */
function replaceUnsafe(text, violationType = 'general') {
  return BOUNDARY_MESSAGES[violationType] || BOUNDARY_MESSAGES.general;
}

/**
 * Add safety prompt for high-risk situations
 */
function addSafetyPrompt(text, riskLevel = 'high') {
  const prompt = SAFETY_PROMPTS[riskLevel] || SAFETY_PROMPTS.high;
  
  // Don't add if already present
  if (text.includes(prompt)) {
    return text;
  }
  
  return text + prompt;
}

/**
 * Check if response has required phrases
 */
function hasRequiredPhrases(text, phrases) {
  const lowerText = text.toLowerCase();
  return phrases.some(phrase => lowerText.includes(phrase.toLowerCase()));
}

/**
 * Check if response has validation (compassionate acknowledgment)
 */
function hasValidation(text) {
  const lowerText = text.toLowerCase();
  return VALIDATION_PHRASES.some(phrase => lowerText.includes(phrase.toLowerCase()));
}

/**
 * Add validation to response
 */
function addValidation(text) {
  // Don't add if already has validation
  if (hasValidation(text)) {
    return text;
  }
  
  const validationPrefixes = [
    "That sounds difficult — it's okay to feel that way. ",
    "I hear you — that must be hard. ",
    "I understand. That's a lot to carry. ",
    "That makes sense. It's okay to feel that way. "
  ];
  
  // Choose validation based on context
  const prefix = validationPrefixes[Math.floor(Math.random() * validationPrefixes.length)];
  return prefix + text;
}

/**
 * Check if response violates therapeutic boundaries
 */
function checkBoundaries(text) {
  const violations = [];
  
  // Check for medical advice
  if (/medical|diagnosis|prescription|medication|symptom/i.test(text)) {
    violations.push('medical');
  }
  
  // Check for legal advice
  if (/legal|lawyer|attorney|sue|litigate/i.test(text)) {
    violations.push('legal');
  }
  
  // Check for diagnostic language
  if (/you (have|suffer from|are experiencing|may have)/i.test(text)) {
    violations.push('diagnostic');
  }
  
  return violations;
}

/**
 * Validate response quality
 */
function validateQuality(text, riskLevel, intent) {
  const issues = [];
  
  // Check minimum length
  if (text.length < 20) {
    issues.push('too_short');
  }
  
  // Check for validation in exploratory intents
  if (['validate', 'probe_story', 'probe_root'].includes(intent) && !hasValidation(text)) {
    issues.push('missing_validation');
  }
  
  // Check for safety prompts in high-risk
  if (riskLevel === 'high' && !hasRequiredPhrases(text, REQUIRED_PHRASES.high)) {
    issues.push('missing_safety_prompt');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

module.exports = {
  filter,
  replaceUnsafe,
  addSafetyPrompt,
  hasRequiredPhrases,
  hasValidation,
  addValidation,
  checkBoundaries,
  validateQuality,
  // Export constants for testing
  UNSAFE_PATTERNS,
  DIAGNOSTIC_PATTERNS,
  REQUIRED_PHRASES,
  SAFETY_PROMPTS,
  BOUNDARY_MESSAGES
};
