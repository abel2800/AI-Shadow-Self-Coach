#!/usr/bin/env node
/**
 * Comprehensive Health Check Script
 * Checks all system components and dependencies
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');
const { getOpenAIClient } = require('../src/config/llm');
const mlModelService = require('../src/services/ml-model.service');
const safetyService = require('../src/services/safety.service');
const logger = require('../src/utils/logger');

const checks = [];
let exitCode = 0;

function addCheck(name, checkFn) {
  checks.push({ name, checkFn });
}

async function runChecks() {
  console.log('='.repeat(60));
  console.log('Comprehensive Health Check');
  console.log('='.repeat(60));
  console.log();

  // Database check
  addCheck('Database Connection', async () => {
    try {
      await sequelize.authenticate();
      return { status: 'ok', message: 'Database connected' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  });

  // Environment variables check
  addCheck('Environment Variables', async () => {
    const required = ['DATABASE_URL', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      return { status: 'error', message: `Missing: ${missing.join(', ')}` };
    }
    
    const optional = ['OPENAI_API_KEY', 'SENTRY_DSN'];
    const missingOptional = optional.filter(key => !process.env[key]);
    
    let message = 'Required variables present';
    if (missingOptional.length > 0) {
      message += ` (Optional missing: ${missingOptional.join(', ')})`;
    }
    
    return { status: 'ok', message };
  });

  // OpenAI API check
  addCheck('OpenAI API', async () => {
    try {
      const client = getOpenAIClient();
      if (!client) {
        return { status: 'warning', message: 'OpenAI API not configured' };
      }
      return { status: 'ok', message: 'OpenAI API configured' };
    } catch (error) {
      return { status: 'warning', message: error.message };
    }
  });

  // ML Models check
  addCheck('ML Models', async () => {
    try {
      const safetyAvailable = await mlModelService.isModelAvailable(
        mlModelService.MODEL_TYPES.SAFETY_CLASSIFIER
      );
      const intentAvailable = await mlModelService.isModelAvailable(
        mlModelService.MODEL_TYPES.INTENT_CLASSIFIER
      );
      
      const models = [];
      if (safetyAvailable) models.push('safety_classifier');
      if (intentAvailable) models.push('intent_classifier');
      
      if (models.length === 0) {
        return { status: 'warning', message: 'No ML models found (using rule-based fallback)' };
      }
      
      return { status: 'ok', message: `Models available: ${models.join(', ')}` };
    } catch (error) {
      return { status: 'warning', message: error.message };
    }
  });

  // Safety service check
  addCheck('Safety Service', async () => {
    try {
      const testMessage = "I'm feeling okay today";
      const result = await safetyService.checkRisk(testMessage);
      
      if (result && result.risk_level) {
        return { 
          status: 'ok', 
          message: `Working (method: ${result.method || 'unknown'})` 
        };
      }
      return { status: 'error', message: 'Safety check returned invalid result' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  });

  // Run all checks
  for (const check of checks) {
    try {
      const result = await check.checkFn();
      const icon = result.status === 'ok' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${check.name}: ${result.message}`);
      
      if (result.status === 'error') {
        exitCode = 1;
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ${error.message}`);
      exitCode = 1;
    }
  }

  console.log();
  console.log('='.repeat(60));
  
  if (exitCode === 0) {
    console.log('✅ All critical checks passed!');
  } else {
    console.log('❌ Some checks failed. Please review errors above.');
  }
  
  console.log('='.repeat(60));
  
  await sequelize.close();
  process.exit(exitCode);
}

runChecks().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

