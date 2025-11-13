/**
 * Session Test Fixtures
 * Reusable session data for tests
 */

const { v4: uuidv4 } = require('uuid');

const sessionFixtures = {
  /**
   * Active check-in session
   */
  activeCheckIn: {
    session_type: 'check_in',
    state: 'active',
    started_at: new Date(),
    mood_score: 5
  },

  /**
   * Completed gentle deep session
   */
  completedGentleDeep: {
    session_type: 'gentle_deep',
    state: 'completed',
    started_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    duration_minutes: 30,
    summary: {
      text: 'A reflective session about personal growth and self-awareness.',
      tags: ['reflection', 'growth', 'self-awareness'],
      insights: [
        'Recognized patterns in emotional responses',
        'Identified areas for personal development'
      ],
      experiment: 'Practice daily mindfulness for 10 minutes'
    }
  },

  /**
   * Completed micro practice session
   */
  completedMicroPractice: {
    session_type: 'micro_practice',
    state: 'completed',
    started_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    duration_minutes: 10,
    summary: {
      text: 'Quick breathing exercise and grounding techniques.',
      tags: ['breathing', 'grounding'],
      insights: ['Breathing exercises help reduce anxiety']
    }
  },

  /**
   * Session with high risk detection
   */
  highRiskSession: {
    session_type: 'gentle_deep',
    state: 'active',
    started_at: new Date(),
    risk_level: 'high',
    risk_detected_at: new Date()
  },

  /**
   * Session with multiple messages
   */
  sessionWithMessages: {
    session_type: 'gentle_deep',
    state: 'completed',
    started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    duration_minutes: 45,
    summary: {
      text: 'Extended conversation about life challenges.',
      tags: ['challenges', 'support'],
      insights: ['Found new coping strategies']
    },
    messages: [
      {
        role: 'user',
        text: 'I\'ve been feeling overwhelmed lately',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        role: 'assistant',
        text: 'I understand. Can you tell me more about what\'s been overwhelming you?',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1000)
      },
      {
        role: 'user',
        text: 'Work has been really stressful',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2000)
      },
      {
        role: 'assistant',
        text: 'Work stress can be challenging. What specific aspects are most difficult?',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3000)
      }
    ]
  }
};

/**
 * Create session data
 */
function createSessionData(fixture = 'activeCheckIn', overrides = {}) {
  const baseData = sessionFixtures[fixture] || sessionFixtures.activeCheckIn;
  return {
    ...baseData,
    ...overrides
  };
}

/**
 * Generate session with date offset
 */
function createSessionWithDateOffset(daysAgo = 0, fixture = 'completedGentleDeep') {
  const baseData = createSessionData(fixture);
  return {
    ...baseData,
    started_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
  };
}

module.exports = {
  sessionFixtures,
  createSessionData,
  createSessionWithDateOffset
};

