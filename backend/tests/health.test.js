/**
 * Health Check Tests
 * Tests for health endpoints
 */

const request = require('supertest');
const app = require('../src/app');

describe('Health Check Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health status', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services).toHaveProperty('openai');
      expect(response.body.services.database).toHaveProperty('status');
      expect(response.body.services.database).toHaveProperty('latency_ms');
    });
  });
});

