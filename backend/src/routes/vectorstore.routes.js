/**
 * Vector Store Routes
 * API endpoints for vector store management
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const vectorStoreService = require('../services/vectorstore.service');

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /vectorstore/status:
 *   get:
 *     summary: Get vector store status
 *     tags: [Vector Store]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vector store status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vector_store:
 *                   type: object
 *                   properties:
 *                     provider:
 *                       type: string
 *                       enum: [pinecone, weaviate, memory]
 *                     initialized:
 *                       type: boolean
 *                     ready:
 *                       type: boolean
 */
router.get('/status', (req, res) => {
  const status = vectorStoreService.getStatus();
  res.status(200).json({
    vector_store: status
  });
});

/**
 * @swagger
 * /vectorstore/search:
 *   post:
 *     summary: Search for relevant context from past sessions
 *     tags: [Vector Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: Search query text
 *               limit:
 *                 type: integer
 *                 default: 5
 *                 minimum: 1
 *                 maximum: 20
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Invalid request
 */
router.post('/search', async (req, res, next) => {
  try {
    const { query, limit = 5 } = req.body;
    const user_id = req.user.id;

    if (!query) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_REQUIRED_FIELD',
          message: 'Query text is required'
        }
      });
    }

    const results = await vectorStoreService.retrieveContext(user_id, query, limit);

    res.status(200).json({
      query,
      results: results.map(r => ({
        session_id: r.sessionId,
        summary: r.summary,
        text_preview: r.text.substring(0, 200),
        relevance_score: r.relevanceScore,
        timestamp: r.timestamp
      })),
      count: results.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

