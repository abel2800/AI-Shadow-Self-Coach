/**
 * Export Service Unit Tests
 */

const exportService = require('../../src/services/export.service');

describe('Export Service', () => {
  const mockSession = {
    id: 'test-session-id',
    session_type: 'gentle_deep',
    started_at: new Date('2024-01-01T10:00:00Z'),
    duration_minutes: 30,
    summary: {
      text: 'This was a productive session about self-reflection.',
      insights: ['Insight 1', 'Insight 2'],
      tags: ['reflection', 'growth'],
      experiment: 'Try journaling daily this week'
    }
  };

  const mockMessages = [
    {
      role: 'user',
      text: 'Hello, I want to talk about my feelings',
      timestamp: new Date('2024-01-01T10:00:00Z')
    },
    {
      role: 'assistant',
      text: 'I\'m here to listen. What would you like to explore?',
      timestamp: new Date('2024-01-01T10:00:30Z')
    },
    {
      role: 'user',
      text: 'I\'ve been feeling anxious lately',
      timestamp: new Date('2024-01-01T10:01:00Z')
    }
  ];

  describe('exportAsText', () => {
    it('should export session as text format', async () => {
      const result = await exportService.exportAsText(mockSession, mockMessages);

      expect(result).toContain('Shadow Coach - Session Export');
      expect(result).toContain('Session Type: gentle_deep');
      expect(result).toContain('Duration: 30 minutes');
      expect(result).toContain('Full Transcript');
      expect(result).toContain('You:');
      expect(result).toContain('Ari:');
      expect(result).toContain('Insights:');
      expect(result).toContain('Insight 1');
      expect(result).toContain('Tags: reflection, growth');
    });

    it('should handle session without messages', async () => {
      const result = await exportService.exportAsText(mockSession, []);

      expect(result).toContain('Shadow Coach - Session Export');
      expect(result).toContain('Session Type: gentle_deep');
      expect(result).not.toContain('Full Transcript');
    });

    it('should handle session without summary', async () => {
      const sessionWithoutSummary = {
        ...mockSession,
        summary: null
      };

      const result = await exportService.exportAsText(sessionWithoutSummary, mockMessages);

      expect(result).toContain('Shadow Coach - Session Export');
      expect(result).toContain('Full Transcript');
    });

    it('should format timestamps correctly', async () => {
      const result = await exportService.exportAsText(mockSession, mockMessages);

      // Check that timestamps are included
      expect(result).toMatch(/\[\d{1,2}:\d{2}:\d{2}\s(AM|PM)\]/);
    });
  });

  describe('exportAsPDF', () => {
    it('should export session as PDF format', async () => {
      const result = await exportService.exportAsPDF(mockSession, mockMessages);

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('format');
      expect(result).toHaveProperty('filename');
      expect(result.format).toBe('text'); // MVP returns text
      expect(result.filename).toContain('session_');
      expect(result.filename).toContain('.txt');
    });

    it('should include session content in PDF export', async () => {
      const result = await exportService.exportAsPDF(mockSession, mockMessages);

      expect(result.content).toContain('Shadow Coach - Session Export');
      expect(result.content).toContain('Session Type: gentle_deep');
    });
  });

  describe('exportMultipleSessions', () => {
    it('should export multiple sessions', async () => {
      const sessions = [
        { ...mockSession, id: 'session-1', messages: mockMessages },
        { ...mockSession, id: 'session-2', messages: mockMessages }
      ];

      const result = await exportService.exportMultipleSessions(sessions, 'text');

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('format');
      expect(result).toHaveProperty('filename');
      expect(result.format).toBe('text');
      expect(result.content).toContain('Total Sessions: 2');
      expect(result.content).toContain('session-1');
      expect(result.content).toContain('session-2');
    });

    it('should handle empty sessions array', async () => {
      const result = await exportService.exportMultipleSessions([], 'text');

      expect(result.content).toContain('Total Sessions: 0');
    });

    it('should export as PDF format', async () => {
      const sessions = [{ ...mockSession, messages: mockMessages }];
      const result = await exportService.exportMultipleSessions(sessions, 'pdf');

      expect(result.format).toBe('pdf');
      expect(result.filename).toContain('.pdf');
    });

    it('should include export date', async () => {
      const sessions = [{ ...mockSession, messages: mockMessages }];
      const result = await exportService.exportMultipleSessions(sessions, 'text');

      expect(result.content).toContain('Export Date:');
    });
  });
});

