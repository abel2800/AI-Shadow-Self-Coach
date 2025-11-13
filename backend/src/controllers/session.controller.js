const { Session, Message, User } = require('../models');
const conversationService = require('../services/conversation.service');
const vectorStoreService = require('../services/vectorstore.service');
const { v4: uuidv4 } = require('uuid');

// Start a new session
exports.startSession = async (req, res, next) => {
  try {
    const { session_type, mood_score, initial_message, consent_for_deep_exploration } = req.body;
    const user_id = req.user.id;

    // Validate session type
    const validTypes = ['check-in', 'gentle_deep', 'micro_practice'];
    if (!validTypes.includes(session_type)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_INVALID_FORMAT',
          message: 'Invalid session type'
        }
      });
    }

    // Create session
    const session = await Session.create({
      id: uuidv4(),
      user_id,
      session_type,
      state: 'active',
      mood_score: mood_score || null,
      started_at: new Date()
    });

    // Generate initial assistant message if initial_message provided
    let assistantMessage = null;
    if (initial_message) {
      assistantMessage = await conversationService.generateResponse(
        initial_message,
        {
          session_id: session.id,
          session_type,
          user_id,
          consent_for_deep_exploration,
          previous_messages: []
        }
      );

      // Save messages
      await Message.create({
        id: uuidv4(),
        session_id: session.id,
        role: 'user',
        text: initial_message,
        timestamp: new Date()
      });

      await Message.create({
        id: uuidv4(),
        session_id: session.id,
        role: 'assistant',
        text: assistantMessage.text,
        intent: assistantMessage.intent,
        risk_level: assistantMessage.risk_level,
        metadata: assistantMessage.metadata || {},
        timestamp: new Date()
      });
    }

    res.status(201).json({
      session_id: session.id,
      assistant_message: assistantMessage,
      session_state: 'active',
      estimated_duration_minutes: session_type === 'check-in' ? 5 : session_type === 'gentle_deep' ? 20 : 10
    });
  } catch (error) {
    next(error);
  }
};

// Send a message in a session
exports.sendMessage = async (req, res, next) => {
  try {
    const { id: session_id } = req.params;
    const { message_text, timestamp } = req.body;
    const user_id = req.user.id;

    // Find session
    const session = await Session.findOne({
      where: { id: session_id, user_id }
    });

    if (!session) {
      return res.status(404).json({
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        }
      });
    }

    if (session.state !== 'active') {
      return res.status(400).json({
        error: {
          code: 'SESSION_NOT_ACTIVE',
          message: 'Session is not active'
        }
      });
    }

    // Save user message
    const userMessage = await Message.create({
      id: uuidv4(),
      session_id,
      role: 'user',
      text: message_text,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    // Get previous messages
    const previousMessages = await Message.findAll({
      where: { session_id },
      order: [['timestamp', 'ASC']],
      limit: 20
    });

    // Generate assistant response
    const assistantResponse = await conversationService.generateResponse(
      message_text,
      {
        session_id,
        session_type: session.session_type,
        user_id: session.user_id,
        previous_messages: previousMessages
      }
    );

    // Save assistant message
    const assistantMessage = await Message.create({
      id: uuidv4(),
      session_id,
      role: 'assistant',
      text: assistantResponse.text,
      intent: assistantResponse.intent,
      risk_level: assistantResponse.risk_level,
      metadata: assistantResponse.metadata || {},
      timestamp: new Date()
    });

    // Handle high-risk escalation
    if (assistantResponse.risk_level === 'high') {
      session.state = 'paused';
      await session.save();
    }

    res.status(200).json({
      assistant_message: {
        text: assistantResponse.text,
        intent: assistantResponse.intent,
        risk_level: assistantResponse.risk_level,
        suggested_followup: assistantResponse.metadata?.suggested_followup || null,
        memory_delta: assistantResponse.metadata?.memory_delta || null,
        timestamp: assistantMessage.timestamp
      },
      session_progress: assistantResponse.session_progress || null,
      session_state: session.state,
      safety_escalation: assistantResponse.risk_level === 'high' ? {
        triggered: true,
        emergency_resources: {
          crisis_hotline: process.env.CRISIS_HOTLINE_US || '988',
          crisis_text: process.env.CRISIS_TEXT_LINE || '741741'
        },
        requires_immediate_attention: true
      } : null
    });
  } catch (error) {
    next(error);
  }
};

// Pause a session
exports.pauseSession = async (req, res, next) => {
  try {
    const { id: session_id } = req.params;
    const user_id = req.user.id;

    const session = await Session.findOne({
      where: { id: session_id, user_id }
    });

    if (!session) {
      return res.status(404).json({
        error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' }
      });
    }

    session.state = 'paused';
    await session.save();

    res.status(200).json({
      session_id: session.id,
      session_state: 'paused',
      paused_at: new Date()
    });
  } catch (error) {
    next(error);
  }
};

// Resume a session
exports.resumeSession = async (req, res, next) => {
  try {
    const { id: session_id } = req.params;
    const { resume_token } = req.body;
    const user_id = req.user.id;

    const session = await Session.findOne({
      where: { id: session_id, user_id }
    });

    if (!session) {
      return res.status(404).json({
        error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' }
      });
    }

    session.state = 'active';
    await session.save();

    // Generate welcome back message
    const welcomeMessage = {
      text: "Welcome back. Where would you like to continue?",
      intent: "validate",
      risk_level: "none",
      suggested_followup: null,
      memory_delta: null,
      timestamp: new Date()
    };

    res.status(200).json({
      session_id: session.id,
      session_state: 'active',
      resumed_at: new Date(),
      assistant_message: welcomeMessage
    });
  } catch (error) {
    next(error);
  }
};

// End a session
exports.endSession = async (req, res, next) => {
  try {
    const { id: session_id } = req.params;
    const { rating, feedback } = req.body;
    const user_id = req.user.id;

    const session = await Session.findOne({
      where: { id: session_id, user_id }
    });

    if (!session) {
      return res.status(404).json({
        error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' }
      });
    }

    // Calculate duration
    const ended_at = new Date();
    const duration_minutes = Math.floor((ended_at - session.started_at) / 1000 / 60);

    // Generate session summary
    const messages = await Message.findAll({
      where: { session_id },
      order: [['timestamp', 'ASC']]
    });

    const summary = await conversationService.generateSessionSummary(messages, session);

    // Update session
    session.state = 'completed';
    session.ended_at = ended_at;
    session.duration_minutes = duration_minutes;
    session.summary = summary;
    await session.save();

    // Store session memory in vector store (if enabled)
    if (process.env.ENABLE_VECTOR_STORE !== 'false') {
      try {
        const sessionText = messages
          .map(m => `${m.role}: ${m.text}`)
          .join('\n');
        
        await vectorStoreService.storeSessionMemory(
          user_id,
          session_id,
          sessionText,
          summary.text || summary.summary || '',
          {
            session_type: session.session_type,
            duration_minutes,
            tags: summary.tags || [],
            insights: summary.insights || []
          }
        );
      } catch (error) {
        // Log error but don't fail the request
        console.error('Failed to store session memory:', error);
      }
    }

    res.status(200).json({
      session_id: session.id,
      session_state: 'completed',
      ended_at,
      summary,
      duration_minutes
    });
  } catch (error) {
    next(error);
  }
};

// Get session summary
exports.getSessionSummary = async (req, res, next) => {
  try {
    const { id: session_id } = req.params;
    const user_id = req.user.id;

    const session = await Session.findOne({
      where: { id: session_id, user_id }
    });

    if (!session) {
      return res.status(404).json({
        error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' }
      });
    }

    const messages = await Message.findAll({
      where: { session_id },
      order: [['timestamp', 'ASC']]
    });

    res.status(200).json({
      session_id: session.id,
      session_type: session.session_type,
      started_at: session.started_at,
      ended_at: session.ended_at,
      duration_minutes: session.duration_minutes,
      summary: session.summary,
      messages: messages.map(msg => ({
        role: msg.role,
        text: msg.text,
        intent: msg.intent,
        timestamp: msg.timestamp
      }))
    });
  } catch (error) {
    next(error);
  }
};

// List user's sessions
exports.listSessions = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { limit = 20, offset = 0, session_type, state, start_date, end_date } = req.query;

    const where = { user_id };
    if (session_type) where.session_type = session_type;
    if (state) where.state = state;
    if (start_date || end_date) {
      where.started_at = {};
      if (start_date) where.started_at[Op.gte] = new Date(start_date);
      if (end_date) where.started_at[Op.lte] = new Date(end_date);
    }

    const { count, rows: sessions } = await Session.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['started_at', 'DESC']]
    });

    res.status(200).json({
      sessions: sessions.map(session => ({
        session_id: session.id,
        session_type: session.session_type,
        state: session.state,
        started_at: session.started_at,
        ended_at: session.ended_at,
        duration_minutes: session.duration_minutes,
        summary_preview: session.summary?.text?.substring(0, 100) || null,
        tags: session.summary?.tags || []
      })),
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: count > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

