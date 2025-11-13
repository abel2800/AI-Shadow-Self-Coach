# Vector Store Integration

Vector store service for session memory and context retrieval using semantic search.

## Features

- ✅ **Multi-provider support**: Pinecone, Weaviate, or in-memory fallback
- ✅ **Automatic context retrieval**: Relevant past sessions retrieved during conversations
- ✅ **Session memory storage**: Sessions automatically stored when completed
- ✅ **Semantic search**: Find relevant context using embeddings
- ✅ **User isolation**: Each user's data is isolated

## Providers

### 1. Pinecone (Recommended for Production)

**Setup:**
```bash
# Install dependency
npm install @pinecone-database/pinecone

# Environment variables
PINECONE_API_KEY=your_api_key
PINECONE_INDEX_NAME=shadow-coach-sessions
VECTOR_STORE_PROVIDER=pinecone
```

**Features:**
- Managed vector database
- High performance
- Scalable
- Pay-as-you-go pricing

### 2. Weaviate (Self-hosted Option)

**Setup:**
```bash
# Install dependency
npm install weaviate-ts-client

# Environment variables
WEAVIATE_URL=http://localhost:8080
WEAVIATE_HOST=localhost:8080
WEAVIATE_SCHEME=http
WEAVIATE_API_KEY=optional_api_key
VECTOR_STORE_PROVIDER=weaviate
```

**Features:**
- Self-hosted
- Open source
- Full control
- Requires infrastructure

### 3. In-Memory (Development/Testing)

**Setup:**
```bash
# No additional dependencies
VECTOR_STORE_PROVIDER=memory
# or omit VECTOR_STORE_PROVIDER
```

**Features:**
- No setup required
- Fast for development
- Data lost on restart
- Not for production

## Configuration

### Environment Variables

```bash
# Provider selection
VECTOR_STORE_PROVIDER=pinecone|weaviate|memory

# Enable/disable vector store
ENABLE_VECTOR_STORE=true|false

# Embedding model
EMBEDDING_MODEL=text-embedding-ada-002

# Pinecone
PINECONE_API_KEY=your_key
PINECONE_INDEX_NAME=shadow-coach-sessions

# Weaviate
WEAVIATE_URL=http://localhost:8080
WEAVIATE_HOST=localhost:8080
WEAVIATE_SCHEME=http
WEAVIATE_API_KEY=optional
```

## Usage

### Automatic Integration

The vector store is automatically integrated into the conversation service:

1. **Context Retrieval**: When generating responses, relevant past sessions are retrieved
2. **Memory Storage**: When sessions end, they're automatically stored in the vector store

### Manual API Usage

#### Get Vector Store Status

```bash
GET /api/v1/vectorstore/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "vector_store": {
    "provider": "pinecone",
    "initialized": true,
    "ready": true
  }
}
```

#### Search for Relevant Context

```bash
POST /api/v1/vectorstore/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "I've been feeling anxious about work",
  "limit": 5
}
```

**Response:**
```json
{
  "query": "I've been feeling anxious about work",
  "results": [
    {
      "session_id": "uuid",
      "summary": "Session about work anxiety...",
      "text_preview": "User: I'm stressed about my job...",
      "relevance_score": 0.85,
      "timestamp": "2024-11-12T10:00:00Z"
    }
  ],
  "count": 1
}
```

## How It Works

### 1. Session Storage

When a session ends:
1. All messages are combined into a text representation
2. Session summary is extracted
3. Text is embedded using OpenAI embeddings
4. Embedding is stored in vector store with metadata

### 2. Context Retrieval

During conversation:
1. User message is embedded
2. Similar past sessions are found using vector similarity
3. Top N relevant sessions are retrieved
4. Context is added to system prompt
5. AI generates response with past context awareness

### 3. Semantic Search

Uses cosine similarity to find:
- Sessions with similar themes
- Related emotional patterns
- Relevant past insights
- Connected experiences

## Data Structure

### Stored Data

```javascript
{
  userId: "user-uuid",
  sessionId: "session-uuid",
  text: "Full session transcript",
  summary: "Session summary text",
  embedding: [0.123, 0.456, ...], // 1536 dimensions for ada-002
  timestamp: Date,
  metadata: {
    session_type: "gentle_deep",
    duration_minutes: 25,
    tags: ["anxiety", "self-worth"],
    insights: ["Pattern identified..."]
  }
}
```

## Performance

### Embedding Generation
- **Model**: `text-embedding-ada-002`
- **Dimensions**: 1536
- **Latency**: ~200-500ms per embedding
- **Cost**: ~$0.0001 per 1K tokens

### Vector Search
- **Pinecone**: <50ms for 10K vectors
- **Weaviate**: <100ms for 10K vectors
- **Memory**: <10ms (limited by dataset size)

## Best Practices

1. **Enable for Production**: Use Pinecone or Weaviate
2. **Disable for Testing**: Use memory provider
3. **Monitor Costs**: Track embedding API usage
4. **Clean Up**: Delete old sessions periodically
5. **Privacy**: Ensure user data isolation

## Troubleshooting

### Vector Store Not Initializing

- Check provider configuration
- Verify API keys (Pinecone/Weaviate)
- Check network connectivity
- Review logs for errors

### No Context Retrieved

- Verify sessions have been completed
- Check embedding generation is working
- Ensure user_id matches
- Review similarity threshold

### High Latency

- Use Pinecone for better performance
- Reduce limit parameter
- Cache embeddings if possible
- Optimize query text

## Future Enhancements

- [ ] Batch embedding generation
- [ ] Embedding caching
- [ ] Custom similarity thresholds
- [ ] Multi-vector search
- [ ] Temporal context (recent sessions weighted higher)
- [ ] Automatic cleanup of old sessions

