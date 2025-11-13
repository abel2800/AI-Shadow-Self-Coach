/**
 * Message Test Fixtures
 * Reusable message data for tests
 */

const messageFixtures = {
  /**
   * User messages
   */
  user: {
    standard: 'I want to explore my feelings today',
    anxious: 'I feel really anxious about work',
    sad: 'I\'ve been feeling down lately',
    grateful: 'I\'m grateful for the support I have',
    confused: 'I\'m not sure how to handle this situation',
    highRisk: 'I want to kill myself',
    mediumRisk: 'I feel hopeless and don\'t see a way out',
    lowRisk: 'I feel sad and depressed about everything'
  },

  /**
   * Assistant messages
   */
  assistant: {
    welcoming: 'I\'m here to listen and support you. What would you like to explore today?',
    reflective: 'That sounds challenging. Can you tell me more about how that makes you feel?',
    supportive: 'I understand. It\'s okay to feel this way. You\'re not alone.',
    exploratory: 'What do you think might be contributing to these feelings?',
    crisisResponse: 'I\'m concerned about what you\'re sharing. Your safety is important. Would you like to talk to someone right now?'
  }
};

/**
 * Create message data
 */
function createMessageData(role = 'user', type = 'standard', overrides = {}) {
  const text = role === 'user' 
    ? messageFixtures.user[type] || messageFixtures.user.standard
    : messageFixtures.assistant[type] || messageFixtures.assistant.welcoming;

  return {
    role,
    text,
    timestamp: new Date(),
    intent: role === 'user' ? 'exploration' : 'support',
    ...overrides
  };
}

/**
 * Create conversation thread
 */
function createConversationThread(messageCount = 3) {
  const messages = [];
  for (let i = 0; i < messageCount; i++) {
    messages.push(createMessageData('user', 'standard', {
      timestamp: new Date(Date.now() - (messageCount - i) * 1000)
    }));
    messages.push(createMessageData('assistant', 'supportive', {
      timestamp: new Date(Date.now() - (messageCount - i) * 1000 + 500)
    }));
  }
  return messages;
}

module.exports = {
  messageFixtures,
  createMessageData,
  createConversationThread
};

