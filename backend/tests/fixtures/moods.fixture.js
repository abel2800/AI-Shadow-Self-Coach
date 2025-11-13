/**
 * Mood Test Fixtures
 * Reusable mood data for tests
 */

const moodFixtures = {
  /**
   * Mood score ranges
   */
  scores: {
    veryLow: 1,
    low: 3,
    neutral: 5,
    good: 7,
    veryGood: 9,
    excellent: 10
  },

  /**
   * Mood notes
   */
  notes: {
    anxious: 'Feeling anxious about upcoming presentation',
    grateful: 'Grateful for supportive friends and family',
    tired: 'Feeling tired but managing okay',
    hopeful: 'Feeling more hopeful about the future',
    overwhelmed: 'Overwhelmed with work and personal responsibilities'
  }
};

/**
 * Create mood data
 */
function createMoodData(score = 5, overrides = {}) {
  return {
    mood_score: score,
    notes: null,
    timestamp: new Date(),
    ...overrides
  };
}

/**
 * Create mood history (array of moods over time)
 */
function createMoodHistory(days = 7, baseScore = 5, variance = 2) {
  const moods = [];
  for (let i = 0; i < days; i++) {
    const score = Math.max(1, Math.min(10, baseScore + Math.floor(Math.random() * variance * 2) - variance));
    moods.push(createMoodData(score, {
      timestamp: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
      notes: i % 2 === 0 ? `Day ${i + 1} notes` : null
    }));
  }
  return moods;
}

/**
 * Create mood trend (improving, declining, stable)
 */
function createMoodTrend(type = 'stable', days = 7) {
  const moods = [];
  let baseScore = 5;

  for (let i = 0; i < days; i++) {
    let score;
    if (type === 'improving') {
      score = Math.min(10, baseScore + (i * 0.5));
    } else if (type === 'declining') {
      score = Math.max(1, baseScore - (i * 0.5));
    } else {
      score = baseScore + (Math.random() * 2 - 1); // Stable with small variance
    }

    moods.push(createMoodData(Math.round(score), {
      timestamp: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000)
    }));
  }

  return moods;
}

module.exports = {
  moodFixtures,
  createMoodData,
  createMoodHistory,
  createMoodTrend
};

