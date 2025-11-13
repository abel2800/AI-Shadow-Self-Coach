/**
 * Analytics Flow Integration Tests
 * Tests mood tracking and analytics endpoints
 */

const request = require('supertest');
const app = require('../../src/app');
const { User, Mood, Session } = require('../../src/models');
const { generateAuthToken } = require('../helpers');

describe('Analytics Flow Integration', () => {
  let testUser;
  let authToken;
  let moodEntries = [];

  beforeAll(async () => {
    testUser = await User.create({
      email: `analytics-flow-${Date.now()}@example.com`,
      password: 'testpassword123'
    });
    authToken = generateAuthToken(testUser);
  });

  afterAll(async () => {
    // Clean up
    await Mood.destroy({ where: { user_id: testUser.id } });
    await User.destroy({ where: { id: testUser.id } });
  });

  describe('Mood Tracking', () => {
    it('should submit mood scores and retrieve history', async () => {
      // Submit multiple mood scores
      const moodScores = [5, 6, 7, 6, 8];
      
      for (let i = 0; i < moodScores.length; i++) {
        const response = await request(app)
          .post('/api/v1/analytics/mood')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            mood_score: moodScores[i],
            notes: `Test mood entry ${i + 1}`,
            timestamp: new Date(Date.now() - (moodScores.length - i) * 24 * 60 * 60 * 1000).toISOString()
          })
          .expect(201);

        expect(response.body).toHaveProperty('mood_id');
        expect(response.body).toHaveProperty('mood_score', moodScores[i]);
        expect(response.body).toHaveProperty('notes', `Test mood entry ${i + 1}`);
        moodEntries.push(response.body.mood_id);
      }

      // Retrieve mood history
      const historyResponse = await request(app)
        .get('/api/v1/analytics/mood')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(historyResponse.body).toHaveProperty('mood_history');
      expect(Array.isArray(historyResponse.body.mood_history)).toBe(true);
      expect(historyResponse.body.mood_history.length).toBeGreaterThanOrEqual(moodScores.length);
    });

    it('should filter mood history by date range', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const response = await request(app)
        .get(`/api/v1/analytics/mood?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('mood_history');
      expect(Array.isArray(response.body.mood_history)).toBe(true);
    });

    it('should reject invalid mood scores', async () => {
      const invalidScores = [0, 11, -1, 100];

      for (const score of invalidScores) {
        await request(app)
          .post('/api/v1/analytics/mood')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ mood_score: score })
          .expect(400);
      }
    });

    it('should get mood statistics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/mood/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('average_mood');
      expect(response.body).toHaveProperty('trend');
      expect(response.body).toHaveProperty('total_entries');
    });
  });

  describe('Insights and Progress', () => {
    it('should get user insights', async () => {
      // Create some completed sessions first
      const session = await Session.create({
        user_id: testUser.id,
        session_type: 'gentle_deep',
        state: 'completed',
        started_at: new Date(),
        duration_minutes: 30,
        summary: {
          text: 'Test session',
          insights: ['Test insight 1', 'Test insight 2']
        }
      });

      const response = await request(app)
        .get('/api/v1/analytics/insights')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('insights');
      expect(Array.isArray(response.body.insights)).toBe(true);

      // Clean up
      await Session.destroy({ where: { id: session.id } });
    });

    it('should get progress summary', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total_sessions');
      expect(response.body).toHaveProperty('total_messages');
      expect(response.body).toHaveProperty('average_mood');
    });
  });
});

