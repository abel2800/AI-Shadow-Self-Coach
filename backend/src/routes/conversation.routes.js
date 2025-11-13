const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All conversation routes require authentication
router.use(authMiddleware);

// Stream conversation responses (WebSocket alternative)
router.post('/stream', conversationController.stream);

module.exports = router;

