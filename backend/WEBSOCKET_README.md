# WebSocket Support

Real-time streaming support for session messages using WebSocket.

## Features

- ✅ Real-time message streaming
- ✅ JWT authentication
- ✅ Safety detection integration
- ✅ Multi-connection support per user
- ✅ Graceful error handling
- ✅ Connection management

## Connection

### WebSocket URL

```
ws://localhost:3000/ws?token=YOUR_JWT_TOKEN
```

### Authentication

The WebSocket connection requires a JWT token passed as a query parameter:

```
ws://localhost:3000/ws?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Message Types

### Client → Server

#### Session Message
```json
{
  "type": "session_message",
  "session_id": "uuid",
  "message_text": "I feel anxious today"
}
```

#### Ping
```json
{
  "type": "ping"
}
```

### Server → Client

#### Connection Confirmed
```json
{
  "type": "connection",
  "status": "connected",
  "timestamp": "2024-11-12T10:00:00Z"
}
```

#### User Message Confirmation
```json
{
  "type": "user_message",
  "text": "I feel anxious today",
  "timestamp": "2024-11-12T10:00:00Z"
}
```

#### Assistant Message Start
```json
{
  "type": "assistant_message_start",
  "timestamp": "2024-11-12T10:00:00Z"
}
```

#### Assistant Message Chunk
```json
{
  "type": "assistant_message_chunk",
  "chunk": "I understand ",
  "is_complete": false,
  "timestamp": "2024-11-12T10:00:00Z"
}
```

#### Assistant Message Complete
```json
{
  "type": "assistant_message_complete",
  "message": {
    "text": "I understand that you're feeling anxious...",
    "intent": "validate",
    "risk_level": "none"
  },
  "timestamp": "2024-11-12T10:00:00Z"
}
```

#### Safety Escalation
```json
{
  "type": "safety_escalation",
  "risk_level": "high",
  "emergency_resources": {
    "crisis_hotline": "988",
    "crisis_text": "741741",
    "message": "If you are in immediate danger..."
  },
  "timestamp": "2024-11-12T10:00:00Z"
}
```

#### Error
```json
{
  "type": "error",
  "message": "Error description",
  "timestamp": "2024-11-12T10:00:00Z"
}
```

#### Pong
```json
{
  "type": "pong",
  "timestamp": "2024-11-12T10:00:00Z"
}
```

## Usage Example

### JavaScript/TypeScript

```javascript
const WebSocket = require('ws');

// Get JWT token from login
const token = 'your_jwt_token_here';

// Connect to WebSocket
const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

ws.on('open', () => {
  console.log('Connected to WebSocket');
  
  // Send a session message
  ws.send(JSON.stringify({
    type: 'session_message',
    session_id: 'session-uuid',
    message_text: 'I feel anxious today'
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  
  switch (message.type) {
    case 'connection':
      console.log('Connection confirmed');
      break;
    case 'assistant_message_chunk':
      // Stream the response
      process.stdout.write(message.chunk);
      break;
    case 'assistant_message_complete':
      console.log('\nComplete message:', message.message.text);
      break;
    case 'safety_escalation':
      console.log('⚠️ Safety escalation:', message.emergency_resources);
      break;
    case 'error':
      console.error('Error:', message.message);
      break;
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('WebSocket closed');
});
```

## Configuration

### Enable/Disable WebSocket

Set environment variable:

```bash
ENABLE_WEBSOCKET=false  # Disable WebSocket
# or omit to enable (default)
```

## Security

- ✅ JWT authentication required
- ✅ Token validation on connection
- ✅ User isolation (users can only access their own sessions)
- ✅ Connection limits per user
- ✅ Error handling for invalid tokens

## Performance

- Supports multiple connections per user
- Efficient message broadcasting
- Connection pooling
- Automatic cleanup on disconnect

## Troubleshooting

### Connection Refused

- Check if WebSocket is enabled (`ENABLE_WEBSOCKET` env var)
- Verify JWT token is valid
- Check server logs for authentication errors

### Messages Not Received

- Verify message format matches expected schema
- Check session_id exists and belongs to user
- Review server logs for errors

### High Memory Usage

- WebSocket connections are kept in memory
- Consider connection limits per user
- Implement connection timeout/cleanup

## Future Enhancements

- [ ] OpenAI streaming API integration
- [ ] Connection rate limiting
- [ ] Message queue for offline users
- [ ] Compression support
- [ ] Binary message support

