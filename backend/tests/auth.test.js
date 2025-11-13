/**
 * Authentication Tests
 * Tests for auth endpoints
 */

const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');
const { sequelize } = require('./setup');

describe('Authentication Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeAll(async () => {
    // Clean up test user if exists
    await User.destroy({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    // Clean up test user
    await User.destroy({ where: { email: testUser.email } });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('user_id');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expires_at');
      expect(typeof response.body.user_id).toBe('string');
      expect(typeof response.body.token).toBe('string');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'short'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate email', async () => {
      // Use unique email for this test
      const uniqueEmail = `duplicate-${Date.now()}@example.com`;
      
      // First registration should succeed
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'password123'
        })
        .expect(201);

      // Second registration with same email should fail
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'password123'
        })
        .expect(409);

      expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Ensure test user exists
      await User.findOrCreate({
        where: { email: testUser.email },
        defaults: { password: testUser.password }
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(testUser)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user_id');
      expect(response.body).toHaveProperty('expires_at');
      expect(typeof response.body.user_id).toBe('string');
      expect(typeof response.body.token).toBe('string');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
    });

    it('should reject wrong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});

