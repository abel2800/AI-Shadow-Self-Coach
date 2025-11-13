/**
 * Response Filter Unit Tests
 */

const responseFilter = require('../../src/utils/responseFilter');

describe('Response Filter', () => {
  describe('Unsafe Pattern Detection', () => {
    it('should block self-harm encouragement', () => {
      const unsafeResponses = [
        'You should kill yourself',
        'You need to end it all',
        'You must hurt yourself',
        'Try to harm yourself'
      ];

      unsafeResponses.forEach(response => {
        const result = responseFilter.filter(response, 'none', null);
        expect(result.wasFiltered).toBe(true);
        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.text).not.toContain('kill');
        expect(result.text).not.toContain('hurt');
      });
    });

    it('should block medical advice', () => {
      const medicalResponses = [
        'You have depression',
        'You are diagnosed with anxiety',
        'You need medication',
        'Medical advice: take these pills',
        'You have a disorder'
      ];

      medicalResponses.forEach(response => {
        const result = responseFilter.filter(response, 'none', null);
        expect(result.wasFiltered).toBe(true);
        expect(result.text).toContain('medical');
        expect(result.text).toContain('healthcare provider');
      });
    });

    it('should block legal advice', () => {
      const legalResponses = [
        'Legal advice: you should sue',
        'You need a lawyer',
        'You should file a lawsuit'
      ];

      legalResponses.forEach(response => {
        const result = responseFilter.filter(response, 'none', null);
        expect(result.wasFiltered).toBe(true);
        expect(result.text).toContain('legal');
        expect(result.text).toContain('attorney');
      });
    });

    it('should block diagnostic language', () => {
      const diagnosticResponses = [
        'You have symptoms of depression',
        'This sounds like anxiety',
        'You may have PTSD'
      ];

      diagnosticResponses.forEach(response => {
        const result = responseFilter.filter(response, 'none', null);
        expect(result.wasFiltered).toBe(true);
        expect(result.text).toContain('not qualified to diagnose');
      });
    });
  });

  describe('Safety Prompt Enforcement', () => {
    it('should add safety prompt for high-risk responses', () => {
      const response = 'I understand you\'re going through a difficult time.';
      const result = responseFilter.filter(response, 'high', null);

      expect(result.text).toContain('concerned about your safety');
      expect(result.text).toContain('988');
      expect(result.text).toContain('741741');
      expect(result.actions).toContain('added_high_risk_prompt');
    });

    it('should not duplicate safety prompts', () => {
      const response = 'I\'m concerned about your safety. Are you safe right now?';
      const result = responseFilter.filter(response, 'high', null);

      const promptCount = (result.text.match(/concerned about your safety/g) || []).length;
      expect(promptCount).toBeLessThanOrEqual(1);
    });

    it('should add support prompt for medium-risk', () => {
      const response = 'That sounds challenging.';
      const result = responseFilter.filter(response, 'medium', null);

      expect(result.text).toContain('support');
      expect(result.actions).toContain('added_medium_risk_prompt');
    });
  });

  describe('Validation Enforcement', () => {
    it('should add validation for exploratory intents', () => {
      const response = 'What happened next?';
      const result = responseFilter.filter(response, 'none', 'probe_story');

      expect(responseFilter.hasValidation(result.text)).toBe(true);
      expect(result.actions).toContain('added_validation');
    });

    it('should not duplicate validation', () => {
      const response = 'That sounds difficult. What happened next?';
      const result = responseFilter.filter(response, 'none', 'probe_story');

      const validationCount = (result.text.match(/sounds|understand|hear/g) || []).length;
      expect(validationCount).toBeLessThanOrEqual(2);
    });
  });

  describe('Response Quality', () => {
    it('should truncate overly long responses', () => {
      const longResponse = 'a'.repeat(3000);
      const result = responseFilter.filter(longResponse, 'none', null, { maxLength: 2000 });

      expect(result.text.length).toBeLessThanOrEqual(2000);
      expect(result.actions).toContain('truncated_length');
    });

    it('should preserve safety prompts when truncating', () => {
      const longResponse = 'a'.repeat(3000);
      const result = responseFilter.filter(longResponse, 'high', null, { maxLength: 2000 });

      expect(result.text).toContain('988');
      expect(result.text).toContain('741741');
    });

    it('should enhance very short responses', () => {
      const shortResponse = 'Okay.';
      const result = responseFilter.filter(shortResponse, 'none', null);

      expect(result.text.length).toBeGreaterThan(shortResponse.length);
      expect(result.actions).toContain('enhanced_short_response');
    });
  });

  describe('Boundary Checking', () => {
    it('should detect medical boundary violations', () => {
      const violations = responseFilter.checkBoundaries('You have depression and need medication');
      expect(violations).toContain('medical');
      expect(violations).toContain('diagnostic');
    });

    it('should detect legal boundary violations', () => {
      const violations = responseFilter.checkBoundaries('You should sue them');
      expect(violations).toContain('legal');
    });
  });

  describe('Quality Validation', () => {
    it('should validate response quality', () => {
      const quality = responseFilter.validateQuality(
        'That sounds difficult. What happened?',
        'none',
        'probe_story'
      );

      expect(quality.isValid).toBe(true);
      expect(quality.issues.length).toBe(0);
    });

    it('should detect quality issues', () => {
      const quality = responseFilter.validateQuality(
        'What?',
        'high',
        'probe_story'
      );

      expect(quality.isValid).toBe(false);
      expect(quality.issues).toContain('too_short');
      expect(quality.issues).toContain('missing_validation');
      expect(quality.issues).toContain('missing_safety_prompt');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty responses', () => {
      const result = responseFilter.filter('', 'none', null);
      expect(result.text.length).toBeGreaterThan(0);
    });

    it('should handle null/undefined risk level', () => {
      const result = responseFilter.filter('Test response', null, null);
      expect(result.text).toBeDefined();
    });

    it('should handle special characters', () => {
      const response = 'That\'s okay — I understand.';
      const result = responseFilter.filter(response, 'none', null);
      expect(result.text).toBeDefined();
    });
  });
});

