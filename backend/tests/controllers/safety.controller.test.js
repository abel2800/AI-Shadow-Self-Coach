/**
 * Safety Controller Unit Tests
 */

const request = require('supertest');
const app = require('../../src/app');
const { User } = require('../../src/models');
const { generateAuthToken } = require('../helpers');

describe('Safety Controller', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    testUser = await User.create({
      email: `safety-test-${Date.now()}@example.com`,
      password: 'testpassword123'
    });
    authToken = generateAuthToken(testUser);
  });

  afterAll(async () => {
    await User.destroy({ where: { id: testUser.id } });
  });

  describe('POST /api/v1/safety/check-in', () => {
    it('should submit safety check-in', async () => {
      const response = await request(app)
        .post('/api/v1/safety/check-in')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          session_id: 'test-session-id',
          safety_status: 'safe',
          message: 'I am doing well'
        })
        .expect(200);

      expect(response.body).toHaveProperty('check_in_id');
      expect(response.body).toHaveProperty('safety_status', 'safe');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('next_check_in');
    });

    it('should accept all valid safety statuses', async () => {
      const statuses = ['safe', 'unsure', 'needs_support'];

      for (const status of statuses) {
        const response = await request(app)
          .post('/api/v1/safety/check-in')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            session_id: 'test-session-id',
            safety_status: status
          })
          .expect(200);

        expect(response.body.safety_status).toBe(status);
      }
    });

    it('should reject invalid safety status', async () => {
      const response = await request(app)
        .post('/api/v1/safety/check-in')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          session_id: 'test-session-id',
          safety_status: 'invalid_status'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_INVALID_FORMAT');
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/v1/safety/check-in')
        .send({
          safety_status: 'safe'
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/safety/resources', () => {
    it('should get crisis resources', async () => {
      const response = await request(app)
        .get('/api/v1/safety/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('resources');
      expect(response.body).toHaveProperty('location');
      expect(Array.isArray(response.body.resources)).toBe(true);
      expect(response.body.resources.length).toBeGreaterThan(0);
    });

    it('should include crisis hotline', async () => {
      const response = await request(app)
        .get('/api/v1/safety/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const hotline = response.body.resources.find(r => r.type === 'crisis_hotline');
      expect(hotline).toBeDefined();
      expect(hotline).toHaveProperty('phone');
      expect(hotline).toHaveProperty('available_24_7', true);
    });

    it('should include crisis text line', async () => {
      const response = await request(app)
        .get('/api/v1/safety/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const textLine = response.body.resources.find(r => r.type === 'crisis_text');
      expect(textLine).toBeDefined();
      expect(textLine).toHaveProperty('text');
      expect(textLine).toHaveProperty('available_24_7', true);
    });

    it('should filter resources by country', async () => {
      const response = await request(app)
        .get('/api/v1/safety/resources?country=US')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.location.country).toBe('US');
    });

    it('should not require authentication', async () => {
      await request(app)
        .get('/api/v1/safety/resources')
        .expect(200);
    });
  });

  describe('POST /api/v1/safety/referral', () => {
    it('should request therapist referral', async () => {
      const response = await request(app)
        .post('/api/v1/safety/referral')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          preferences: {
            location: 'New York',
            insurance: 'Blue Cross'
          },
          consent_for_contact: true
        })
        .expect(200);

      expect(response.body).toHaveProperty('referral_id');
      expect(response.body).toHaveProperty('status', 'processing');
      expect(response.body).toHaveProperty('estimated_response');
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/v1/safety/referral')
        .send({
          preferences: {}
        })
        .expect(401);
    });
  });
});

