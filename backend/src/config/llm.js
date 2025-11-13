/**
 * LLM Configuration
 * OpenAI API configuration and helpers
 */

const OpenAI = require('openai');

let openaiClient = null;

/**
 * Initialize OpenAI client
 */
function initializeOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not set. Conversation service will not work.');
    return null;
  }

  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  return openaiClient;
}

/**
 * Get OpenAI client
 */
function getOpenAIClient() {
  if (!openaiClient) {
    return initializeOpenAI();
  }
  return openaiClient;
}

/**
 * Check if OpenAI is configured
 */
function isOpenAIConfigured() {
  return !!process.env.OPENAI_API_KEY && !!openaiClient;
}

module.exports = {
  initializeOpenAI,
  getOpenAIClient,
  isOpenAIConfigured
};

