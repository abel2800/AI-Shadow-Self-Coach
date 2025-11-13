/**
 * Journal Export Integration Tests
 * Tests journal export functionality end-to-end
 */

const request = require('supertest');
const app = require('../../src/app');
const { User, Session, Message } = require('../../src/models');
const { generateAuthToken } = require('../helpers');

describe('Journal Export Integration', () => {
  let testUser;
  let authToken;
  let completedSessions = [];

  beforeAll(async () => {
    testUser = await User.create({
      email: `journal-export-${Date.now()}@example.com`,
      password: 'testpassword123'
    });
    authToken = generateAuthToken(testUser);

    // Create completed sessions for export
    for (let i = 0; i < 3; i++) {
      const session = await Session.create({
        user_id: testUser.id,
        session_type: 'gentle_deep',
        state: 'completed',
        started_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Different dates
        duration_minutes: 30,
        summary: {
          text: `Session ${i + 1} summary`,
          tags: ['test', `tag${i}`],
          insights: [`Insight ${i + 1}`]
        }
      });

      await Message.create({
        session_id: session.id,
        role: 'user',
        text: `User message ${i + 1}`,
        timestamp: new Date()
      });

      await Message.create({
        session_id: session.id,
        role: 'assistant',
        text: `Assistant response ${i + 1}`,
        timestamp: new Date()
      });

      completedSessions.push(session);
    }
  });

  afterAll(async () => {
    // Clean up
    for (const session of completedSessions) {
      await Message.destroy({ where: { session_id: session.id } });
      await Session.destroy({ where: { id: session.id } });
    }
    await User.destroy({ where: { id: testUser.id } });
  });

  describe('Export Functionality', () => {
    it('should export single session as text', async () => {
      const sessionId = completedSessions[0].id;

      const response = await request(app)
        .post('/api/v1/journal/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'text',
          session_ids: [sessionId],
          include_transcript: true,
          include_highlights: true
        })
        .expect(200);

      expect(response.body).toHaveProperty('export_id');
      expect(response.body).toHaveProperty('status', 'completed');
      expect(response.body).toHaveProperty('format', 'text');
      expect(response.body).toHaveProperty('filename');
      expect(response.body).toHaveProperty('content');
      expect(response.body.content).toContain('Shadow Coach');
      expect(response.body.content).toContain('Session 1 summary');
    });

    it('should export multiple sessions', async () => {
      const sessionIds = completedSessions.map(s => s.id);

      const response = await request(app)
        .post('/api/v1/journal/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'text',
          session_ids: sessionIds,
          include_transcript: true
        })
        .expect(200);

      expect(response.body.content).toContain('Total Sessions: 3');
      expect(response.body.content).toContain('Session 1');
      expect(response.body.content).toContain('Session 2');
      expect(response.body.content).toContain('Session 3');
    });

    it('should export by date range', async () => {
      const startDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const response = await request(app)
        .post('/api/v1/journal/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'text',
          date_range: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          },
          include_transcript: true
        })
        .expect(200);

      expect(response.body).toHaveProperty('content');
      expect(response.body.content).toContain('Total Sessions');
    });

    it('should require session_ids or date_range', async () => {
      const response = await request(app)
        .post('/api/v1/journal/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'text'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_REQUIRED_FIELD');
    });

    it('should export as PDF format', async () => {
      const sessionId = completedSessions[0].id;

      const response = await request(app)
        .post('/api/v1/journal/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'pdf',
          session_ids: [sessionId],
          include_transcript: true
        })
        .expect(200);

      expect(response.body.format).toBe('pdf');
      expect(response.body.filename).toContain('.pdf');
    });
  });

  describe('Journal Entry Management', () => {
    it('should list journal entries with filters', async () => {
      const response = await request(app)
        .get('/api/v1/journal/entries?tags=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.entries.length).toBeGreaterThan(0);
      response.body.entries.forEach(entry => {
        expect(entry.tags).toContain('test');
      });
    });

    it('should get journal entry details', async () => {
      const sessionId = completedSessions[0].id;

      const response = await request(app)
        .get(`/api/v1/journal/entries/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('session_id', sessionId);
      expect(response.body).toHaveProperty('full_transcript');
      expect(Array.isArray(response.body.full_transcript)).toBe(true);
    });
  });
});

