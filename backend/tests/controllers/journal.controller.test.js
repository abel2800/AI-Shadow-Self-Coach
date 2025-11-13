/**
 * Journal Controller Unit Tests
 */

const request = require('supertest');
const app = require('../../src/app');
const { User, Session, Message } = require('../../src/models');
const { generateAuthToken } = require('../helpers');

describe('Journal Controller', () => {
  let testUser;
  let authToken;
  let testSession;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      email: `journal-test-${Date.now()}@example.com`,
      password: 'testpassword123'
    });
    authToken = generateAuthToken(testUser);
  });

  beforeEach(async () => {
    // Create test session
    testSession = await Session.create({
      user_id: testUser.id,
      session_type: 'gentle_deep',
      state: 'completed',
      started_at: new Date(),
      duration_minutes: 30,
      summary: {
        text: 'Test session summary',
        tags: ['test', 'reflection'],
        insights: ['Test insight']
      }
    });

    // Create test messages
    await Message.create({
      session_id: testSession.id,
      role: 'user',
      text: 'Test user message',
      timestamp: new Date()
    });

    await Message.create({
      session_id: testSession.id,
      role: 'assistant',
      text: 'Test assistant message',
      timestamp: new Date()
    });
  });

  afterEach(async () => {
    // Clean up
    await Message.destroy({ where: { session_id: testSession.id } });
    await Session.destroy({ where: { id: testSession.id } });
  });

  afterAll(async () => {
    await User.destroy({ where: { id: testUser.id } });
  });

  describe('GET /api/v1/journal/entries', () => {
    it('should list journal entries', async () => {
      const response = await request(app)
        .get('/api/v1/journal/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('entries');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.entries)).toBe(true);
    });

    it('should filter entries by tags', async () => {
      const response = await request(app)
        .get('/api/v1/journal/entries?tags=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.entries.length).toBeGreaterThan(0);
      response.body.entries.forEach(entry => {
        expect(entry.tags).toContain('test');
      });
    });

    it('should filter entries by search query', async () => {
      const response = await request(app)
        .get('/api/v1/journal/entries?search=summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.entries.length).toBeGreaterThan(0);
    });

    it('should paginate entries', async () => {
      const response = await request(app)
        .get('/api/v1/journal/entries?limit=1&offset=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.entries.length).toBeLessThanOrEqual(1);
      expect(response.body.pagination).toHaveProperty('limit', 1);
      expect(response.body.pagination).toHaveProperty('offset', 0);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/journal/entries')
        .expect(401);
    });
  });

  describe('GET /api/v1/journal/entries/:session_id', () => {
    it('should get journal entry detail', async () => {
      const response = await request(app)
        .get(`/api/v1/journal/entries/${testSession.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('session_id', testSession.id);
      expect(response.body).toHaveProperty('session_type');
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('full_transcript');
      expect(Array.isArray(response.body.full_transcript)).toBe(true);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .get('/api/v1/journal/entries/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not return other users sessions', async () => {
      const otherUser = await User.create({
        email: `other-user-${Date.now()}@example.com`,
        password: 'password123'
      });
      const otherSession = await Session.create({
        user_id: otherUser.id,
        session_type: 'check_in',
        state: 'completed',
        started_at: new Date()
      });

      await request(app)
        .get(`/api/v1/journal/entries/${otherSession.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      await Session.destroy({ where: { id: otherSession.id } });
      await User.destroy({ where: { id: otherUser.id } });
    });
  });

  describe('POST /api/v1/journal/entries/:session_id/highlights', () => {
    it('should add highlight to session', async () => {
      const message = await Message.findOne({ where: { session_id: testSession.id } });

      const response = await request(app)
        .post(`/api/v1/journal/entries/${testSession.id}/highlights`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message_id: message.id,
          note: 'This is important'
        })
        .expect(200);

      expect(response.body).toHaveProperty('highlight_id');
      expect(response.body).toHaveProperty('message_id', message.id);
      expect(response.body).toHaveProperty('note', 'This is important');
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .post('/api/v1/journal/entries/non-existent-id/highlights')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message_id: 'test-id' })
        .expect(404);
    });
  });

  describe('PUT /api/v1/journal/entries/:session_id/tags', () => {
    it('should update session tags', async () => {
      const response = await request(app)
        .put(`/api/v1/journal/entries/${testSession.id}/tags`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tags: ['new-tag', 'another-tag']
        })
        .expect(200);

      expect(response.body).toHaveProperty('tags');
      expect(response.body.tags).toEqual(['new-tag', 'another-tag']);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .put('/api/v1/journal/entries/non-existent-id/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tags: [] })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/journal/entries/:session_id', () => {
    it('should delete journal entry', async () => {
      const sessionToDelete = await Session.create({
        user_id: testUser.id,
        session_type: 'check_in',
        state: 'completed',
        started_at: new Date()
      });

      await request(app)
        .delete(`/api/v1/journal/entries/${sessionToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      const deleted = await Session.findByPk(sessionToDelete.id);
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent session', async () => {
      await request(app)
        .delete('/api/v1/journal/entries/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

