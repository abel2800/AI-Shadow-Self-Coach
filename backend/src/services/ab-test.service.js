/**
 * A/B Testing Service
 * Manages A/B tests for model versions
 */

const { ABTest, ABTestAssignment, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Create a new A/B test
 */
async function createABTest(testData) {
  try {
    const abTest = await ABTest.create({
      id: uuidv4(),
      name: testData.name,
      model_type: testData.model_type,
      variant_a: testData.variant_a,
      variant_b: testData.variant_b,
      traffic_split: testData.traffic_split || { a: 0.5, b: 0.5 },
      status: testData.status || 'draft',
      start_date: testData.start_date || null,
      end_date: testData.end_date || null,
      criteria: testData.criteria || {},
      metadata: testData.metadata || {}
    });

    logger.info('A/B test created', { testId: abTest.id, name: abTest.name });
    return abTest;
  } catch (error) {
    logger.error('Failed to create A/B test', error);
    throw error;
  }
}

/**
 * Get active A/B tests for a model type
 */
async function getActiveTests(modelType) {
  try {
    const tests = await ABTest.findAll({
      where: {
        model_type: modelType,
        status: 'active'
      },
      order: [['created_at', 'DESC']]
    });

    return tests;
  } catch (error) {
    logger.error('Failed to get active A/B tests', error);
    throw error;
  }
}

/**
 * Assign user to a test variant
 */
async function assignUserToVariant(userId, testId) {
  try {
    // Check if user is already assigned
    const existing = await ABTestAssignment.findOne({
      where: { user_id: userId, ab_test_id: testId }
    });

    if (existing) {
      return existing.variant;
    }

    // Get test configuration
    const test = await ABTest.findByPk(testId);
    if (!test || test.status !== 'active') {
      return null;
    }

    // Assign based on traffic split
    const random = Math.random();
    const variant = random < test.traffic_split.a ? 'a' : 'b';

    // Create assignment
    await ABTestAssignment.create({
      id: uuidv4(),
      user_id: userId,
      ab_test_id: testId,
      variant,
      assigned_at: new Date()
    });

    logger.debug('User assigned to A/B test variant', {
      userId,
      testId,
      variant
    });

    return variant;
  } catch (error) {
    logger.error('Failed to assign user to variant', error);
    throw error;
  }
}

/**
 * Get model version for user based on A/B tests
 */
async function getModelVersionForUser(userId, modelType) {
  try {
    // Get active tests for this model type
    const activeTests = await getActiveTests(modelType);

    if (activeTests.length === 0) {
      // No active tests, return default/latest version
      return null;
    }

    // For now, use the most recent test
    // In production, you might want to support multiple concurrent tests
    const test = activeTests[0];

    // Assign user to variant if not already assigned
    const variant = await assignUserToVariant(userId, test.id);

    if (!variant) {
      return null;
    }

    // Return model version based on variant
    const version = variant === 'a' ? test.variant_a : test.variant_b;

    return {
      version,
      variant,
      test_id: test.id,
      test_name: test.name
    };
  } catch (error) {
    logger.error('Failed to get model version for user', error);
    return null;
  }
}

/**
 * Record A/B test metric
 */
async function recordMetric(testId, variant, metricType, value) {
  try {
    const test = await ABTest.findByPk(testId);
    if (!test) {
      return;
    }

    const metrics = test.metrics || {
      variant_a: { requests: 0, errors: 0, avg_latency: 0 },
      variant_b: { requests: 0, errors: 0, avg_latency: 0 }
    };

    const variantKey = `variant_${variant}`;

    if (!metrics[variantKey]) {
      metrics[variantKey] = { requests: 0, errors: 0, avg_latency: 0 };
    }

    // Update metrics
    switch (metricType) {
      case 'request':
        metrics[variantKey].requests += 1;
        break;
      case 'error':
        metrics[variantKey].errors += 1;
        break;
      case 'latency':
        // Update average latency
        const currentAvg = metrics[variantKey].avg_latency;
        const requestCount = metrics[variantKey].requests;
        metrics[variantKey].avg_latency = 
          (currentAvg * (requestCount - 1) + value) / requestCount;
        break;
    }

    await test.update({ metrics });

    logger.debug('A/B test metric recorded', {
      testId,
      variant,
      metricType,
      value
    });
  } catch (error) {
    logger.error('Failed to record A/B test metric', error);
  }
}

/**
 * Start an A/B test
 */
async function startTest(testId) {
  try {
    const test = await ABTest.findByPk(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    await test.update({
      status: 'active',
      start_date: new Date()
    });

    logger.info('A/B test started', { testId, name: test.name });
    return test;
  } catch (error) {
    logger.error('Failed to start A/B test', error);
    throw error;
  }
}

/**
 * Pause an A/B test
 */
async function pauseTest(testId) {
  try {
    const test = await ABTest.findByPk(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    await test.update({ status: 'paused' });

    logger.info('A/B test paused', { testId, name: test.name });
    return test;
  } catch (error) {
    logger.error('Failed to pause A/B test', error);
    throw error;
  }
}

/**
 * Complete an A/B test
 */
async function completeTest(testId, winner = null) {
  try {
    const test = await ABTest.findByPk(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    await test.update({
      status: 'completed',
      end_date: new Date(),
      metadata: {
        ...test.metadata,
        winner
      }
    });

    logger.info('A/B test completed', { testId, name: test.name, winner });
    return test;
  } catch (error) {
    logger.error('Failed to complete A/B test', error);
    throw error;
  }
}

/**
 * Get test statistics
 */
async function getTestStats(testId) {
  try {
    const test = await ABTest.findByPk(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    // Get assignment counts
    const assignments = await ABTestAssignment.findAll({
      where: { ab_test_id: testId }
    });

    const variantACount = assignments.filter(a => a.variant === 'a').length;
    const variantBCount = assignments.filter(a => a.variant === 'b').length;

    return {
      test_id: test.id,
      name: test.name,
      status: test.status,
      metrics: test.metrics,
      assignments: {
        variant_a: variantACount,
        variant_b: variantBCount,
        total: assignments.length
      },
      start_date: test.start_date,
      end_date: test.end_date
    };
  } catch (error) {
    logger.error('Failed to get test stats', error);
    throw error;
  }
}

module.exports = {
  createABTest,
  getActiveTests,
  assignUserToVariant,
  getModelVersionForUser,
  recordMetric,
  startTest,
  pauseTest,
  completeTest,
  getTestStats
};

