/**
 * WebSocket Service
 * Real-time streaming support for session messages
 */

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const conversationService = require('./conversation.service');
const safetyService = require('./safety.service');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({
      server,
      path: '/ws',
      verifyClient: (info, callback) => {
        // Verify JWT token from query string
        const token = new URL(info.req.url, 'http://localhost').searchParams.get('token');
        if (!token) {
          callback(false, 401, 'Missing authentication token');
          return;
        }

        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          info.req.userId = decoded.user_id;
          callback(true);
        } catch (error) {
          callback(false, 401, 'Invalid authentication token');
        }
      }
    });

    this.clients = new Map(); // userId -> Set of WebSocket connections
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.wss.on('connection', async (ws, req) => {
      const userId = req.userId;
      
      // Add client to map
      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId).add(ws);

      console.log(`✅ WebSocket connected: User ${userId}`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        timestamp: new Date().toISOString()
      }));

      // Handle incoming messages
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, userId, message);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: new Date().toISOString()
          }));
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        if (this.clients.has(userId)) {
          this.clients.get(userId).delete(ws);
          if (this.clients.get(userId).size === 0) {
            this.clients.delete(userId);
          }
        }
        console.log(`❌ WebSocket disconnected: User ${userId}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  async handleMessage(ws, userId, message) {
    const { type, session_id, message_text, ...otherData } = message;

    switch (type) {
      case 'session_message':
        await this.handleSessionMessage(ws, userId, session_id, message_text);
        break;
      
      case 'ping':
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString()
        }));
        break;
      
      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: `Unknown message type: ${type}`,
          timestamp: new Date().toISOString()
        }));
    }
  }

  async handleSessionMessage(ws, userId, sessionId, messageText) {
    try {
      // Check safety first
      const safetyCheck = await safetyService.checkRisk(messageText);
      
      if (safetyCheck.risk_level === 'high') {
        ws.send(JSON.stringify({
          type: 'safety_escalation',
          risk_level: safetyCheck.risk_level,
          emergency_resources: {
            crisis_hotline: '988',
            crisis_text: '741741',
            message: 'If you are in immediate danger, please call 911 or your local emergency services.'
          },
          timestamp: new Date().toISOString()
        }));
        return;
      }

      // Send user message confirmation
      ws.send(JSON.stringify({
        type: 'user_message',
        text: messageText,
        timestamp: new Date().toISOString()
      }));

      // Generate AI response with streaming
      await this.streamResponse(ws, sessionId, messageText, safetyCheck);
    } catch (error) {
      console.error('Session message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message',
        timestamp: new Date().toISOString()
      }));
    }
  }

  async streamResponse(ws, sessionId, userMessage, safetyCheck) {
    try {
      // For now, send complete response (streaming will be added with OpenAI streaming API)
      const response = await conversationService.generateResponse(
        sessionId,
        userMessage,
        safetyCheck
      );

      // Send response in chunks to simulate streaming
      const words = response.text.split(' ');
      ws.send(JSON.stringify({
        type: 'assistant_message_start',
        timestamp: new Date().toISOString()
      }));

      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between words
        ws.send(JSON.stringify({
          type: 'assistant_message_chunk',
          chunk: words[i] + (i < words.length - 1 ? ' ' : ''),
          is_complete: i === words.length - 1,
          timestamp: new Date().toISOString()
        }));
      }

      ws.send(JSON.stringify({
        type: 'assistant_message_complete',
        message: response,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Stream response error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to generate response',
        timestamp: new Date().toISOString()
      }));
    }
  }

  // Broadcast message to all connections for a user
  broadcastToUser(userId, message) {
    if (this.clients.has(userId)) {
      const messageStr = JSON.stringify(message);
      this.clients.get(userId).forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      });
    }
  }

  // Get connection count for a user
  getConnectionCount(userId) {
    return this.clients.has(userId) ? this.clients.get(userId).size : 0;
  }
}

module.exports = WebSocketService;

