/**
 * Test Data Factory
 * Factory functions for creating test data
 */

const { User, Session, Message, Mood } = require('../../src/models');
const fixtures = require('../fixtures');

/**
 * Create a complete test user with token
 */
async function createTestUserWithToken(fixture = 'standard', overrides = {}) {
  const userData = await fixtures.createUserData(fixture, overrides);
  const user = await User.create(userData);
  
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { user_id: user.id },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );

  return { user, token };
}

/**
 * Create a complete session with messages
 */
async function createCompleteSession(userId, sessionFixture = 'completedGentleDeep', messageCount = 4) {
  const sessionData = fixtures.createSessionData(sessionFixture);
  const session = await Session.create({
    ...sessionData,
    user_id: userId
  });

  const messages = fixtures.createConversationThread(messageCount);
  const createdMessages = [];
  
  for (const msgData of messages) {
    const message = await Message.create({
      ...msgData,
      session_id: session.id
    });
    createdMessages.push(message);
  }

  return { session, messages: createdMessages };
}

/**
 * Create multiple sessions for a user
 */
async function createMultipleSessions(userId, count = 3, daysAgo = 0) {
  const sessions = [];
  
  for (let i = 0; i < count; i++) {
    const sessionData = fixtures.createSessionWithDateOffset(
      daysAgo + i,
      i % 2 === 0 ? 'completedGentleDeep' : 'completedMicroPractice'
    );
    
    const session = await Session.create({
      ...sessionData,
      user_id: userId
    });
    
    // Add some messages
    const messages = fixtures.createConversationThread(2);
    for (const msgData of messages) {
      await Message.create({
        ...msgData,
        session_id: session.id
      });
    }
    
    sessions.push(session);
  }
  
  return sessions;
}

/**
 * Create mood history for a user
 */
async function createMoodHistory(userId, days = 7, baseScore = 5) {
  const moods = fixtures.createMoodHistory(days, baseScore);
  const createdMoods = [];
  
  for (const moodData of moods) {
    const mood = await Mood.create({
      ...moodData,
      user_id: userId
    });
    createdMoods.push(mood);
  }
  
  return createdMoods;
}

/**
 * Create a complete test scenario (user + sessions + moods)
 */
async function createCompleteTestScenario(options = {}) {
  const {
    userFixture = 'standard',
    sessionCount = 3,
    moodDays = 7,
    messagesPerSession = 4
  } = options;

  // Create user
  const { user, token } = await createTestUserWithToken(userFixture);

  // Create sessions
  const sessions = await createMultipleSessions(user.id, sessionCount, 0);

  // Create mood history
  const moods = await createMoodHistory(user.id, moodDays);

  return {
    user,
    token,
    sessions,
    moods
  };
}

/**
 * Clean up test data
 */
async function cleanupTestData(userIds = []) {
  if (userIds.length > 0) {
    // Clean up specific users
    for (const userId of userIds) {
      await Message.destroy({ where: { session_id: { in: await Session.findAll({ where: { user_id: userId }, attributes: ['id'] }) } } });
      await Session.destroy({ where: { user_id: userId } });
      await Mood.destroy({ where: { user_id: userId } });
      await User.destroy({ where: { id: userId } });
    }
  } else {
    // Clean up all test data
    await Message.destroy({ where: {}, truncate: true, cascade: true });
    await Session.destroy({ where: {}, truncate: true, cascade: true });
    await Mood.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
  }
}

module.exports = {
  createTestUserWithToken,
  createCompleteSession,
  createMultipleSessions,
  createMoodHistory,
  createCompleteTestScenario,
  cleanupTestData
};

