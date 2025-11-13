// Hard-constraint response filter
// Removes unsafe suggestions and guarantees safety prompts

const unsafePatterns = [
  /you should (kill|hurt|harm)/i,
  /you need to (die|end it)/i,
  /medical advice:/i,
  /legal advice:/i,
  /you have (depression|anxiety|bipolar|ptsd)/i
];

const requiredPhrases = {
  high_risk: [
    "I'm concerned about your safety",
    "Are you safe right now?",
    "crisis resources"
  ]
};

/**
 * Filter assistant response to ensure safety
 */
function filter(responseText, riskLevel, intent) {
  // Remove unsafe patterns
  for (const pattern of unsafePatterns) {
    if (pattern.test(responseText)) {
      return replaceUnsafe(responseText);
    }
  }

  // Add required phrases for high-risk
  if (riskLevel === 'high') {
    if (!hasRequiredPhrases(responseText, requiredPhrases.high_risk)) {
      return addSafetyPrompt(responseText);
    }
  }

  // Ensure validation for certain intents
  if (intent === 'validate' || intent === 'probe_story' || intent === 'probe_root') {
    if (!hasValidation(responseText)) {
      return addValidation(responseText);
    }
  }

  return responseText;
}

/**
 * Replace unsafe content
 */
function replaceUnsafe(text) {
  return "I can't provide advice on that. Would you like to explore what's underneath that feeling instead?";
}

/**
 * Add safety prompt for high-risk situations
 */
function addSafetyPrompt(text) {
  const safetyPrompt = "\n\nI'm concerned about your safety. Are you safe right now? If you're in crisis, please contact 988 or text HOME to 741741.";
  return text + safetyPrompt;
}

/**
 * Check if response has required phrases
 */
function hasRequiredPhrases(text, phrases) {
  const lowerText = text.toLowerCase();
  return phrases.some(phrase => lowerText.includes(phrase.toLowerCase()));
}

/**
 * Check if response has validation
 */
function hasValidation(text) {
  const validationPhrases = [
    "it's okay",
    "that sounds",
    "I'm sorry",
    "that must feel"
  ];
  const lowerText = text.toLowerCase();
  return validationPhrases.some(phrase => lowerText.includes(phrase));
}

/**
 * Add validation to response
 */
function addValidation(text) {
  return "That sounds difficult — it's okay to feel that way. " + text;
}

module.exports = {
  filter
};

