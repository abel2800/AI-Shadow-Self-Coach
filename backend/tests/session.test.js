/**
 * Session Tests
 * Tests for session endpoints
 */

const request = require('supertest');
const app = require('../src/app');
const { User, Session } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Session Endpoints', () => {
  let authToken;
  let testUser;
  let testSession;

  beforeAll(async () => {
    // Create test user and get token
    testUser = await User.create({
      email: 'sessiontest@example.com',
      password: 'password123'
    });

    authToken = jwt.sign(
      { user_id: testUser.id },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up
    if (testSession) await testSession.destroy();
    if (testUser) await testUser.destroy();
  });

  describe('POST /api/v1/session/start', () => {
    it('should start a new session successfully', async () => {
      // Skip if OpenAI API key is not configured
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_ope')) {
        console.log('⚠️  Skipping session test - OpenAI API key not configured');
        return;
      }

      const response = await request(app)
        .post('/api/v1/session/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          session_type: 'gentle_deep',
          mood_score: 5,
          initial_message: 'I feel anxious today'
        })
        .expect(201);

      expect(response.body).toHaveProperty('session_id');
      expect(response.body).toHaveProperty('assistant_message');
      expect(response.body.session_type).toBe('gentle_deep');
      
      testSession = await Session.findByPk(response.body.session_id);
      expect(testSession).toBeTruthy();
    });

    it('should reject invalid session type', async () => {
      const response = await request(app)
        .post('/api/v1/session/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          session_type: 'invalid_type',
          mood_score: 5
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/session/start')
        .send({
          session_type: 'gentle_deep',
          mood_score: 5
        })
        .expect(401);

      expect(response.body.error.code).toBe('AUTH_MISSING_TOKEN');
    });
  });

  describe('POST /api/v1/session/:id/message', () => {
    beforeEach(async () => {
      // Create a test session if it doesn't exist
      if (!testSession) {
        try {
          testSession = await Session.create({
            user_id: testUser.id,
            session_type: 'gentle_deep',
            state: 'active',
            started_at: new Date()
          });
        } catch (error) {
          // If session already exists, find it
          testSession = await Session.findOne({
            where: { user_id: testUser.id, state: 'active' }
          });
        }
      }
    });

    it('should send a message successfully', async () => {
      // Skip if OpenAI API key is not configured
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_ope')) {
        console.log('⚠️  Skipping message test - OpenAI API key not configured');
        return;
      }

      const response = await request(app)
        .post(`/api/v1/session/${testSession.id}/message`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message_text: 'I feel better now'
        })
        .expect(200);

      expect(response.body).toHaveProperty('assistant_message');
      expect(response.body.assistant_message).toHaveProperty('text');
    });

    it('should reject empty message', async () => {
      const response = await request(app)
        .post(`/api/v1/session/${testSession.id}/message`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message_text: ''
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject message that is too long', async () => {
      const longMessage = 'a'.repeat(5001);
      const response = await request(app)
        .post(`/api/v1/session/${testSession.id}/message`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message_text: longMessage
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});

