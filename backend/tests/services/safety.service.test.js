/**
 * Safety Service Unit Tests
 */

const safetyService = require('../../src/services/safety.service');

describe('Safety Service', () => {
  describe('checkRisk', () => {
    it('should detect high-risk messages', async () => {
      const highRiskMessages = [
        'I want to kill myself',
        'I am going to end my life',
        'I think about suicide',
        'I want to die',
        'I hurt myself',
        'I cut myself',
        'I self harm',
        'There is no reason to live'
      ];

      for (const message of highRiskMessages) {
        const result = await safetyService.checkRisk(message);
        expect(result.risk_level).toBe('high');
        expect(result.confidence).toBeGreaterThan(0.9);
        expect(result.category).toBe('suicidal_ideation');
        expect(result.urgency).toBe('immediate');
      }
    });

    it('should detect medium-risk messages', async () => {
      const mediumRiskMessages = [
        'I feel hopeless',
        'There is no point',
        'I want to give up',
        'I can\'t go on',
        'Nothing matters anymore'
      ];

      for (const message of mediumRiskMessages) {
        const result = await safetyService.checkRisk(message);
        expect(result.risk_level).toBe('medium');
        expect(result.confidence).toBeGreaterThan(0.7);
        expect(result.category).toBe('distress');
        expect(result.urgency).toBe('moderate');
      }
    });

    it('should detect low-risk messages with negative sentiment', async () => {
      const lowRiskMessages = [
        'I feel sad and depressed',
        'I am anxious and worried',
        'I am scared and afraid',
        'I feel sad, depressed, and anxious'
      ];

      for (const message of lowRiskMessages) {
        const result = await safetyService.checkRisk(message);
        expect(result.risk_level).toBe('low');
        expect(result.confidence).toBeGreaterThan(0.5);
        expect(result.category).toBe('negative_sentiment');
        expect(result.urgency).toBe('low');
      }
    });

    it('should return safe for normal messages', async () => {
      const safeMessages = [
        'Hello, how are you?',
        'I had a good day today',
        'I am feeling okay',
        'Can you help me with something?',
        'I want to talk about my goals'
      ];

      for (const message of safeMessages) {
        const result = await safetyService.checkRisk(message);
        expect(result.risk_level).toBe('none');
        expect(result.confidence).toBeGreaterThan(0.8);
        expect(result.category).toBe('safe');
        expect(result.urgency).toBe('none');
      }
    });

    it('should be case-insensitive', async () => {
      const result1 = await safetyService.checkRisk('I WANT TO KILL MYSELF');
      const result2 = await safetyService.checkRisk('i want to kill myself');
      const result3 = await safetyService.checkRisk('I Want To Kill Myself');

      expect(result1.risk_level).toBe('high');
      expect(result2.risk_level).toBe('high');
      expect(result3.risk_level).toBe('high');
    });

    it('should handle empty messages', async () => {
      const result = await safetyService.checkRisk('');
      expect(result.risk_level).toBe('none');
      expect(result.category).toBe('safe');
    });

    it('should handle messages with partial matches', async () => {
      // Should not match partial words
      const result1 = await safetyService.checkRisk('I killed the spider');
      expect(result1.risk_level).not.toBe('high');

      // Should match full phrases
      const result2 = await safetyService.checkRisk('I want to kill myself');
      expect(result2.risk_level).toBe('high');
    });
  });
});

