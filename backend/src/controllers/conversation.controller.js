const conversationService = require('../services/conversation.service');

// Stream conversation responses
exports.stream = async (req, res, next) => {
  try {
    const { session_id, message_text, timestamp } = req.body;
    const user_id = req.user.id;

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Generate response (streaming would be implemented here)
    const response = await conversationService.generateResponse(
      message_text,
      {
        session_id,
        user_id,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }
    );

    // Send chunks (simplified - in production, use OpenAI streaming API)
    const chunks = response.text.split(' ');
    chunks.forEach((chunk, index) => {
      res.write(`data: ${JSON.stringify({
        type: 'chunk',
        text: chunk + ' ',
        chunk_id: index + 1
      })}\n\n`);
    });

    // Send complete message
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      assistant_message: response
    })}\n\n`);

    res.end();
  } catch (error) {
    next(error);
  }
};

