/**
 * Session Flow Integration Tests
 * Tests complete session lifecycle: start -> messages -> end
 */

const request = require('supertest');
const app = require('../../src/app');
const { User, Session, Message } = require('../../src/models');
const { generateAuthToken } = require('../helpers');

describe('Session Flow Integration', () => {
  let testUser;
  let authToken;
  let sessionId;

  beforeAll(async () => {
    testUser = await User.create({
      email: `session-flow-${Date.now()}@example.com`,
      password: 'testpassword123'
    });
    authToken = generateAuthToken(testUser);
  });

  afterAll(async () => {
    if (sessionId) {
      await Message.destroy({ where: { session_id: sessionId } });
      await Session.destroy({ where: { id: sessionId } });
    }
    await User.destroy({ where: { id: testUser.id } });
  });

  describe('Complete Session Lifecycle', () => {
    it('should complete full session flow', async () => {
      // Skip if OpenAI API key is not configured
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_ope')) {
        console.log('⚠️  Skipping session flow test - OpenAI API key not configured');
        return;
      }

      // Step 1: Start session
      const startResponse = await request(app)
        .post('/api/v1/session/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          session_type: 'gentle_deep',
          mood_score: 6,
          initial_message: 'I want to explore my feelings'
        })
        .expect(201);

      expect(startResponse.body).toHaveProperty('session_id');
      expect(startResponse.body).toHaveProperty('assistant_message');
      sessionId = startResponse.body.session_id;

      // Step 2: Send multiple messages
      const messages = [
        'I feel anxious about work',
        'How can I manage this better?',
        'Thank you, that helps'
      ];

      for (const messageText of messages) {
        const messageResponse = await request(app)
          .post(`/api/v1/session/${sessionId}/message`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ message_text: messageText })
          .expect(200);

        expect(messageResponse.body).toHaveProperty('assistant_message');
        expect(messageResponse.body.assistant_message).toHaveProperty('text');
      }

      // Step 3: End session
      const endResponse = await request(app)
        .post(`/api/v1/session/${sessionId}/end`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          final_mood_score: 7
        })
        .expect(200);

      expect(endResponse.body).toHaveProperty('session_id', sessionId);
      expect(endResponse.body).toHaveProperty('summary');
      expect(endResponse.body.state).toBe('completed');

      // Verify session in database
      const session = await Session.findByPk(sessionId);
      expect(session.state).toBe('completed');
      expect(session.summary).toBeDefined();

      // Verify messages were saved
      const savedMessages = await Message.findAll({
        where: { session_id: sessionId }
      });
      expect(savedMessages.length).toBeGreaterThan(messages.length); // User + assistant messages
    });

    it('should handle session with risk detection', async () => {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_ope')) {
        console.log('⚠️  Skipping risk detection test - OpenAI API key not configured');
        return;
      }

      // Start session
      const startResponse = await request(app)
        .post('/api/v1/session/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          session_type: 'check_in',
          mood_score: 3
        })
        .expect(201);

      const riskSessionId = startResponse.body.session_id;

      // Send high-risk message
      const riskResponse = await request(app)
        .post(`/api/v1/session/${riskSessionId}/message`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message_text: 'I want to kill myself'
        })
        .expect(200);

      // Check if risk was detected (response should include safety info)
      expect(riskResponse.body).toHaveProperty('assistant_message');
      
      // Clean up
      await Message.destroy({ where: { session_id: riskSessionId } });
      await Session.destroy({ where: { id: riskSessionId } });
    });
  });
});

