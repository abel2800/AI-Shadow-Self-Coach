/**
 * Constants
 * Application-wide constants
 */

module.exports = {
  // Session Types
  SESSION_TYPES: {
    CHECK_IN: 'check-in',
    GENTLE_DEEP: 'gentle_deep',
    MICRO_PRACTICE: 'micro_practice'
  },

  // Session States
  SESSION_STATES: {
    ACTIVE: 'active',
    PAUSED: 'paused',
    COMPLETED: 'completed'
  },

  // Risk Levels
  RISK_LEVELS: {
    NONE: 'none',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  },

  // Intents
  INTENTS: {
    VALIDATE: 'validate',
    PROBE_STORY: 'probe_story',
    PROBE_ROOT: 'probe_root',
    REFRAME: 'reframe',
    SUGGEST_EXPERIMENT: 'suggest_experiment',
    OFFER_MINDFULNESS: 'offer_mindfulness',
    SAFETY_CHECK: 'safety_check',
    EMERGENCY: 'emergency',
    CLOSE: 'close',
    OTHER: 'other'
  },

  // Sentiment
  SENTIMENT: {
    VERY_NEGATIVE: 'very_negative',
    NEGATIVE: 'negative',
    NEUTRAL: 'neutral',
    POSITIVE: 'positive'
  },

  // Crisis Resources
  CRISIS_RESOURCES: {
    US_HOTLINE: '988',
    US_TEXT: '741741'
  },

  // Validation
  VALIDATION_KEYWORDS: [
    "it's okay",
    "that sounds",
    "i'm sorry",
    "that must feel",
    "i hear you",
    "thank you for sharing"
  ],

  // Safety Patterns
  HIGH_RISK_PATTERNS: [
    'kill myself',
    'end my life',
    'suicide',
    'want to die',
    'hurt myself',
    'cut myself',
    'self harm',
    'no reason to live'
  ]
};

