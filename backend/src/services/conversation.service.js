const { getOpenAIClient, isOpenAIConfigured } = require('../config/llm');
const safetyService = require('./safety.service');
const responseFilter = require('../utils/responseFilter');
const vectorStoreService = require('./vectorstore.service');
const logger = require('../utils/logger');

// System prompt for Ari persona
const SYSTEM_PROMPT = `You are "Ari", a compassionate, non-judgmental inner-work coach. Your job is to help users gently explore recurring negative beliefs and emotional patterns.

Core Principles:
1. Always begin with validation before probing deeper
2. Ask for consent before deeper exploration ("Are you ready to look at this together?")
3. Keep responses brief (2-4 sentences) unless user asks for longer reflection
4. Use reflective questions rather than direct advice
5. Offer one practical experiment at the end of a deep session
6. Avoid medical or legal advice

Safety Protocol:
- If user mentions self-harm or suicide, immediately:
  1. Acknowledge with compassion
  2. Ask about immediate safety
  3. Provide crisis resources
  4. Follow emergency escalation flow

Tone Guidelines:
- Compassionate and gentle
- Slightly poetic but grounded
- No clinical jargon (unless user asks)
- Short, reflective sentences
- Validate feelings first

Example Response Style:
User: "I keep thinking I'm a failure."
Ari: "That feeling must be heavy — I'm sorry you're carrying that. Would you like to tell me about the last time that thought showed up? You can stop any time."`;

/**
 * Generate AI response to user message
 */
async function generateResponse(userMessage, context) {
  try {
    // 1. Check safety first
    const safetyCheck = await safetyService.checkRisk(userMessage);
    
    if (safetyCheck.risk_level === 'high') {
      return {
        text: "I'm concerned about what you've shared. Your safety matters. Are you safe right now?",
        intent: "emergency",
        risk_level: "high",
        metadata: {
          safety_escalation: true
        }
      };
    }

    // 2. Retrieve relevant context from past sessions (if enabled)
    let pastContext = '';
    if (context.user_id && process.env.ENABLE_VECTOR_STORE !== 'false') {
      try {
        const relevantSessions = await vectorStoreService.retrieveContext(
          context.user_id,
          userMessage,
          3 // Get top 3 relevant past sessions
        );

        if (relevantSessions.length > 0) {
          pastContext = '\n\nRelevant context from past sessions:\n';
          relevantSessions.forEach((session, index) => {
            pastContext += `${index + 1}. ${session.summary || session.text.substring(0, 200)}...\n`;
          });
        }
      } catch (error) {
        logger.warn('Vector store retrieval failed, continuing without past context:', error.message);
      }
    }

    // 3. Build conversation context
    const enhancedSystemPrompt = SYSTEM_PROMPT + pastContext;
    const messages = [
      { role: 'system', content: enhancedSystemPrompt }
    ];

    // Add previous messages if available
    if (context.previous_messages) {
      context.previous_messages.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    // 4. Generate response
    const openai = getOpenAIClient();
    if (!openai) {
      throw new Error('OpenAI API not configured. Please set OPENAI_API_KEY in .env');
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
    });

    let assistantText = completion.choices[0].message.content;

    // 5. Classify intent (simplified - in production, use intent classifier)
    const intent = classifyIntent(assistantText);

    // 6. Filter response (hard constraints)
    const filterResult = responseFilter.filter(
      assistantText, 
      safetyCheck.risk_level, 
      intent,
      { maxLength: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000 }
    );
    assistantText = filterResult.text;
    
    // Log if response was filtered
    if (filterResult.wasFiltered) {
      logger.warn('Response was filtered', {
        actions: filterResult.actions,
        violations: filterResult.violations.length,
        riskLevel: safetyCheck.risk_level,
        intent
      });
    }

    // 7. Extract metadata
    const metadata = {
      suggested_followup: extractFollowup(assistantText),
      memory_delta: extractMemoryDelta(assistantText, context)
    };

    return {
      text: assistantText,
      intent: intent,
      risk_level: safetyCheck.risk_level,
      metadata: metadata,
      session_progress: context.session_type === 'gentle_deep' ? calculateProgress(context) : null
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
}

/**
 * Classify intent from assistant response (simplified)
 * In production, use trained intent classifier
 */
function classifyIntent(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('would you like to tell me') || lowerText.includes('can you tell me')) {
    return 'probe_story';
  }
  if (lowerText.includes('when did you first') || lowerText.includes('what did that remind you')) {
    return 'probe_root';
  }
  if (lowerText.includes('let\'s test') || lowerText.includes('what evidence')) {
    return 'reframe';
  }
  if (lowerText.includes('experiment') || lowerText.includes('try this week')) {
    return 'suggest_experiment';
  }
  if (lowerText.includes('breathing') || lowerText.includes('exercise') || lowerText.includes('practice')) {
    return 'offer_mindfulness';
  }
  if (lowerText.includes('it\'s okay') || lowerText.includes('that sounds') || lowerText.includes('i\'m sorry')) {
    return 'validate';
  }
  
  return 'other';
}

/**
 * Extract suggested follow-up from response
 */
function extractFollowup(text) {
  // Simple extraction - in production, use more sophisticated NLP
  if (text.includes('Would you like to') || text.includes('Do you want to')) {
    return text.match(/(Would you like to|Do you want to)[^.]*\./)?.[0] || null;
  }
  return null;
}

/**
 * Extract memory delta (insights, tags) from response
 */
function extractMemoryDelta(text, context) {
  // Simplified - in production, use more sophisticated extraction
  const insights = [];
  const tags = [];

  // Extract common patterns
  if (text.toLowerCase().includes('self-worth') || text.toLowerCase().includes('not enough')) {
    tags.push('self-worth');
  }
  if (text.toLowerCase().includes('anxiety') || text.toLowerCase().includes('worried')) {
    tags.push('anxiety');
  }
  if (text.toLowerCase().includes('pattern')) {
    insights.push('Pattern identified in user responses');
  }

  return {
    insights: insights.length > 0 ? insights : null,
    tags: tags.length > 0 ? tags : null
  };
}

/**
 * Calculate session progress for structured sessions
 */
function calculateProgress(context) {
  // Simplified - in production, track actual step progression
  return {
    step: 1,
    total_steps: 7,
    step_name: "Validate + Invite Consent"
  };
}

/**
 * Generate session summary
 */
async function generateSessionSummary(messages, session) {
  // Extract key insights from messages
  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');

  // Simple summary generation - in production, use LLM to generate summary
  const summary = {
    text: `You explored feelings and patterns in this ${session.session_type} session.`,
    insights: [],
    tags: [],
    experiment: null
  };

  // Extract tags from assistant messages
  const tags = new Set();
  assistantMessages.forEach(msg => {
    if (msg.metadata?.memory_delta?.tags) {
      msg.metadata.memory_delta.tags.forEach(tag => tags.add(tag));
    }
  });
  summary.tags = Array.from(tags);

  // Extract experiment if mentioned
  const experimentMessage = assistantMessages.find(msg => msg.intent === 'suggest_experiment');
  if (experimentMessage) {
    summary.experiment = experimentMessage.text.match(/experiment[^.]*\./)?.[0] || null;
  }

  return summary;
}

module.exports = {
  generateResponse,
  generateSessionSummary
};

