const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journal.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');

// All journal routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /journal/entries:
 *   get:
 *     summary: List journal entries (completed sessions)
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: session_type
 *         schema:
 *           type: string
 *           enum: [check-in, gentle_deep, micro_practice]
 *     responses:
 *       200:
 *         description: Journal entries retrieved successfully
 */
router.get('/entries', journalController.listEntries);

/**
 * @swagger
 * /journal/entry/{session_id}:
 *   get:
 *     summary: Get detailed journal entry
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Journal entry details
 *       404:
 *         description: Entry not found
 */
router.get('/entry/:session_id', journalController.getEntry);

// Add highlight to session
router.post('/entry/:session_id/highlight', journalController.addHighlight);

// Update tags for session
router.post('/entry/:session_id/tags', journalController.updateTags);

// Export journal entries
router.post('/export', validate(schemas.exportEntries), journalController.exportEntries);

// Get export status
router.get('/export/:export_id', journalController.getExportStatus);

// Download export
router.get('/export/:export_id/download', journalController.downloadExport);

// Delete journal entry
router.delete('/entry/:session_id', journalController.deleteEntry);

module.exports = router;

