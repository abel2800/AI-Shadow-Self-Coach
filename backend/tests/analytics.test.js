/**
 * Analytics Tests
 * Tests for analytics endpoints
 */

const request = require('supertest');
const app = require('../src/app');
const { User, Mood } = require('../src/models');
const { createTestUser, generateAuthToken, cleanupTestData } = require('./helpers');

describe('Analytics Endpoints', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Create test user
    testUser = await createTestUser('analyticstest@example.com');
    authToken = generateAuthToken(testUser);
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/v1/analytics/mood', () => {
    it('should submit mood successfully', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/mood')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mood_score: 7,
          notes: 'Feeling good today'
        })
        .expect(201);

      expect(response.body).toHaveProperty('mood_id');
      expect(response.body.mood_score).toBe(7);
      expect(response.body.notes).toBe('Feeling good today');
    });

    it('should reject invalid mood score (too low)', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/mood')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mood_score: 0,
          notes: 'Test'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid mood score (too high)', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/mood')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mood_score: 11,
          notes: 'Test'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/mood')
        .send({
          mood_score: 5
        })
        .expect(401);

      expect(response.body.error.code).toBe('AUTH_MISSING_TOKEN');
    });
  });

  describe('GET /api/v1/analytics/mood', () => {
    beforeEach(async () => {
      // Create some test mood entries
      await Mood.bulkCreate([
        { user_id: testUser.id, mood_score: 5, timestamp: new Date('2024-01-01') },
        { user_id: testUser.id, mood_score: 6, timestamp: new Date('2024-01-02') },
        { user_id: testUser.id, mood_score: 7, timestamp: new Date('2024-01-03') }
      ]);
    });

    afterEach(async () => {
      await Mood.destroy({ where: { user_id: testUser.id } });
    });

    it('should get mood history successfully', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/mood')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('mood_scores');
      expect(response.body).toHaveProperty('statistics');
      expect(Array.isArray(response.body.mood_scores)).toBe(true);
      expect(response.body.statistics).toHaveProperty('average');
    });

    it('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/mood')
        .query({
          start_date: '2024-01-02',
          end_date: '2024-01-03'
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.mood_scores.length).toBe(2);
    });
  });
});

