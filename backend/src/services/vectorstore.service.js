/**
 * Vector Store Service
 * Manages session memory and context using vector embeddings
 * Supports Pinecone, Weaviate, and fallback to in-memory store
 */

const { getOpenAIClient } = require('../config/llm');
const logger = require('../utils/logger');

class VectorStoreService {
  constructor() {
    this.provider = process.env.VECTOR_STORE_PROVIDER || 'memory'; // 'pinecone', 'weaviate', 'memory'
    this.client = null;
    this.memoryStore = new Map(); // Fallback in-memory store
    this.initialize();
  }

  async initialize() {
    try {
      switch (this.provider) {
        case 'pinecone':
          await this.initializePinecone();
          break;
        case 'weaviate':
          await this.initializeWeaviate();
          break;
        case 'memory':
          logger.info('Using in-memory vector store (development mode)');
          break;
        default:
          logger.warn(`Unknown vector store provider: ${this.provider}, using memory`);
          this.provider = 'memory';
      }
    } catch (error) {
      logger.error('Vector store initialization error:', error);
      logger.warn('Falling back to in-memory store');
      this.provider = 'memory';
    }
  }

  async initializePinecone() {
    try {
      const { Pinecone } = require('@pinecone-database/pinecone');
      
      if (!process.env.PINECONE_API_KEY) {
        throw new Error('PINECONE_API_KEY not configured');
      }

      this.client = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
      });

      const indexName = process.env.PINECONE_INDEX_NAME || 'shadow-coach-sessions';
      this.index = this.client.index(indexName);
      
      logger.info('✅ Pinecone vector store initialized');
    } catch (error) {
      logger.error('Pinecone initialization error:', error);
      throw error;
    }
  }

  async initializeWeaviate() {
    try {
      const weaviate = require('weaviate-ts-client');
      
      if (!process.env.WEAVIATE_URL) {
        throw new Error('WEAVIATE_URL not configured');
      }

      this.client = weaviate.client({
        scheme: process.env.WEAVIATE_SCHEME || 'http',
        host: process.env.WEAVIATE_HOST || 'localhost:8080',
        apiKey: process.env.WEAVIATE_API_KEY ? new weaviate.ApiKey(process.env.WEAVIATE_API_KEY) : undefined
      });

      // Create schema if it doesn't exist
      await this.createWeaviateSchema();
      
      logger.info('✅ Weaviate vector store initialized');
    } catch (error) {
      logger.error('Weaviate initialization error:', error);
      throw error;
    }
  }

  async createWeaviateSchema() {
    const className = 'SessionMemory';
    
    try {
      const schemaExists = await this.client.schema.exists(className);
      if (schemaExists) {
        return;
      }

      await this.client.schema.classCreator()
        .withClass({
          class: className,
          description: 'Session memory embeddings for context retrieval',
          vectorizer: 'text2vec-openai',
          moduleConfig: {
            'text2vec-openai': {
              model: 'text-embedding-ada-002',
              modelVersion: '002',
              type: 'text'
            }
          },
          properties: [
            {
              name: 'userId',
              dataType: ['string'],
              description: 'User ID'
            },
            {
              name: 'sessionId',
              dataType: ['string'],
              description: 'Session ID'
            },
            {
              name: 'text',
              dataType: ['text'],
              description: 'Session text content'
            },
            {
              name: 'summary',
              dataType: ['text'],
              description: 'Session summary'
            },
            {
              name: 'timestamp',
              dataType: ['date'],
              description: 'Session timestamp'
            },
            {
              name: 'metadata',
              dataType: ['object'],
              description: 'Additional metadata'
            }
          ]
        })
        .do();

      logger.info('✅ Weaviate schema created');
    } catch (error) {
      logger.error('Weaviate schema creation error:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for text using OpenAI
   */
  async generateEmbedding(text) {
    try {
      const openai = getOpenAIClient();
      if (!openai) {
        throw new Error('OpenAI client not available');
      }

      const response = await openai.embeddings.create({
        model: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
        input: text
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('Embedding generation error:', error);
      throw error;
    }
  }

  /**
   * Store session memory
   */
  async storeSessionMemory(userId, sessionId, text, summary, metadata = {}) {
    try {
      const embedding = await this.generateEmbedding(text);

      const memoryData = {
        userId,
        sessionId,
        text,
        summary,
        embedding,
        timestamp: new Date(),
        metadata
      };

      switch (this.provider) {
        case 'pinecone':
          await this.storeInPinecone(memoryData);
          break;
        case 'weaviate':
          await this.storeInWeaviate(memoryData);
          break;
        case 'memory':
          this.storeInMemory(memoryData);
          break;
      }

      logger.info(`✅ Stored session memory for user ${userId}, session ${sessionId}`);
      return true;
    } catch (error) {
      logger.error('Store session memory error:', error);
      throw error;
    }
  }

  async storeInPinecone(data) {
    const id = `${data.userId}_${data.sessionId}`;
    
    await this.index.upsert([{
      id,
      values: data.embedding,
      metadata: {
        userId: data.userId,
        sessionId: data.sessionId,
        text: data.text.substring(0, 1000), // Pinecone metadata limit
        summary: data.summary,
        timestamp: data.timestamp.toISOString(),
        ...data.metadata
      }
    }]);
  }

  async storeInWeaviate(data) {
    await this.client.data.creator()
      .withClassName('SessionMemory')
      .withProperties({
        userId: data.userId,
        sessionId: data.sessionId,
        text: data.text,
        summary: data.summary,
        timestamp: data.timestamp,
        metadata: JSON.stringify(data.metadata)
      })
      .do();
  }

  storeInMemory(data) {
    const key = `${data.userId}_${data.sessionId}`;
    this.memoryStore.set(key, data);
  }

  /**
   * Retrieve relevant context from past sessions
   */
  async retrieveContext(userId, queryText, limit = 5) {
    try {
      const queryEmbedding = await this.generateEmbedding(queryText);

      let results = [];

      switch (this.provider) {
        case 'pinecone':
          results = await this.queryPinecone(userId, queryEmbedding, limit);
          break;
        case 'weaviate':
          results = await this.queryWeaviate(userId, queryText, limit);
          break;
        case 'memory':
          results = this.queryMemory(userId, queryEmbedding, limit);
          break;
      }

      return results.map(result => ({
        sessionId: result.sessionId,
        text: result.text,
        summary: result.summary,
        timestamp: result.timestamp,
        relevanceScore: result.score || result.certainty || 0,
        metadata: result.metadata
      }));
    } catch (error) {
      logger.error('Retrieve context error:', error);
      return [];
    }
  }

  async queryPinecone(userId, queryEmbedding, limit) {
    const queryResponse = await this.index.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
      filter: {
        userId: { $eq: userId }
      }
    });

    return queryResponse.matches.map(match => ({
      sessionId: match.metadata.sessionId,
      text: match.metadata.text,
      summary: match.metadata.summary,
      timestamp: new Date(match.metadata.timestamp),
      score: match.score,
      metadata: match.metadata
    }));
  }

  async queryWeaviate(userId, queryText, limit) {
    const result = await this.client.graphql
      .get()
      .withClassName('SessionMemory')
      .withFields('userId sessionId text summary timestamp metadata')
      .withNearText({ concepts: [queryText] })
      .withWhere({
        path: ['userId'],
        operator: 'Equal',
        valueString: userId
      })
      .withLimit(limit)
      .do();

    return result.data.Get.SessionMemory.map(item => ({
      sessionId: item.sessionId,
      text: item.text,
      summary: item.summary,
      timestamp: new Date(item.timestamp),
      certainty: item._additional?.certainty || 0,
      metadata: typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata
    }));
  }

  queryMemory(userId, queryEmbedding, limit) {
    // Simple cosine similarity search in memory
    const userMemories = Array.from(this.memoryStore.values())
      .filter(m => m.userId === userId);

    const results = userMemories.map(memory => {
      const score = this.cosineSimilarity(queryEmbedding, memory.embedding);
      return { ...memory, score };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Delete session memory
   */
  async deleteSessionMemory(userId, sessionId) {
    try {
      switch (this.provider) {
        case 'pinecone':
          await this.index.delete1(`${userId}_${sessionId}`);
          break;
        case 'weaviate':
          await this.client.data.deleter()
            .withClassName('SessionMemory')
            .withWhere({
              path: ['sessionId'],
              operator: 'Equal',
              valueString: sessionId
            })
            .do();
          break;
        case 'memory':
          this.memoryStore.delete(`${userId}_${sessionId}`);
          break;
      }

      logger.info(`✅ Deleted session memory for user ${userId}, session ${sessionId}`);
      return true;
    } catch (error) {
      logger.error('Delete session memory error:', error);
      throw error;
    }
  }

  /**
   * Get provider status
   */
  getStatus() {
    return {
      provider: this.provider,
      initialized: this.client !== null || this.provider === 'memory',
      ready: this.provider === 'memory' || (this.client !== null)
    };
  }
}

// Singleton instance
const vectorStoreService = new VectorStoreService();

module.exports = vectorStoreService;

