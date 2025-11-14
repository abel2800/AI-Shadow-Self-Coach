const { Session, Message } = require('../models');
const { Op } = require('sequelize');
const exportService = require('../services/export.service');

// List journal entries
exports.listEntries = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { limit = 20, offset = 0, tags, start_date, end_date, search } = req.query;

    const where = { user_id, state: 'completed' };
    
    if (start_date || end_date) {
      where.started_at = {};
      if (start_date) where.started_at[Op.gte] = new Date(start_date);
      if (end_date) where.started_at[Op.lte] = new Date(end_date);
    }

    const sessions = await Session.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['started_at', 'DESC']]
    });

    // Filter by tags if provided
    let filteredSessions = sessions;
    if (tags) {
      const tagArray = tags.split(',');
      filteredSessions = sessions.filter(session => {
        const sessionTags = session.summary?.tags || [];
        return tagArray.some(tag => sessionTags.includes(tag));
      });
    }

    // Filter by search if provided
    if (search) {
      filteredSessions = filteredSessions.filter(session => {
        const searchLower = search.toLowerCase();
        return (
          session.summary?.text?.toLowerCase().includes(searchLower) ||
          session.summary?.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });
    }

    res.status(200).json({
      entries: filteredSessions.map(session => ({
        session_id: session.id,
        session_type: session.session_type,
        date: session.started_at,
        summary: session.summary?.text || '',
        tags: session.summary?.tags || [],
        insights: session.summary?.insights || [],
        highlights: session.summary?.highlights || []
      })),
      pagination: {
        total: filteredSessions.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: filteredSessions.length > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get journal entry detail
exports.getEntry = async (req, res, next) => {
  try {
    const { session_id } = req.params;
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
      date: session.started_at,
      duration_minutes: session.duration_minutes,
      summary: session.summary,
      full_transcript: messages.map(msg => ({
        role: msg.role,
        text: msg.text,
        intent: msg.intent,
        timestamp: msg.timestamp
      })),
      highlights: session.summary?.highlights || []
    });
  } catch (error) {
    next(error);
  }
};

// Add highlight to session
exports.addHighlight = async (req, res, next) => {
  try {
    const { session_id } = req.params;
    const { message_id, note } = req.body;
    const user_id = req.user.id;

    const session = await Session.findOne({
      where: { id: session_id, user_id }
    });

    if (!session) {
      return res.status(404).json({
        error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' }
      });
    }

    const message = await Message.findOne({
      where: { id: message_id, session_id }
    });

    if (!message) {
      return res.status(404).json({
        error: { code: 'MESSAGE_NOT_FOUND', message: 'Message not found' }
      });
    }

    // TODO: Implement highlights table/model
    const highlight = {
      highlight_id: require('uuid').v4(),
      message_id,
      text: message.text,
      note: note || null,
      highlighted_at: new Date()
    };

    res.status(200).json(highlight);
  } catch (error) {
    next(error);
  }
};

// Update tags for session
exports.updateTags = async (req, res, next) => {
  try {
    const { session_id } = req.params;
    const { tags } = req.body;
    const user_id = req.user.id;

    const session = await Session.findOne({
      where: { id: session_id, user_id }
    });

    if (!session) {
      return res.status(404).json({
        error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' }
      });
    }

    // Update summary with tags
    const summary = session.summary || {};
    summary.tags = tags || [];
    session.summary = summary;
    await session.save();

    res.status(200).json({
      session_id: session.id,
      tags: summary.tags,
      updated_at: new Date()
    });
  } catch (error) {
    next(error);
  }
};

// Export journal entries
exports.exportEntries = async (req, res, next) => {
  try {
    const { format, session_ids, date_range, include_transcript, include_highlights } = req.body;
    const user_id = req.user.id;

    const exportService = require('../services/export.service');
    
    // Get sessions to export
    let sessions;
    if (session_ids && session_ids.length > 0) {
      sessions = await Session.findAll({
        where: {
          id: { [Op.in]: session_ids },
          user_id,
          state: 'completed'
        },
        include: [{
          model: Message,
          as: 'messages',
          required: include_transcript
        }]
      });
    } else if (date_range) {
      const where = { user_id, state: 'completed' };
      if (date_range.start) where.started_at = { [Op.gte]: new Date(date_range.start) };
      if (date_range.end) {
        if (!where.started_at) where.started_at = {};
        where.started_at[Op.lte] = new Date(date_range.end);
      }
      
      sessions = await Session.findAll({
        where,
        include: [{
          model: Message,
          as: 'messages',
          required: include_transcript
        }]
      });
    } else {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_REQUIRED_FIELD',
          message: 'Either session_ids or date_range must be provided'
        }
      });
    }

    // Generate export
    let exportData;
    if (format === 'pdf') {
      exportData = await exportService.exportMultipleSessions(sessions, 'pdf');
    } else {
      exportData = await exportService.exportMultipleSessions(sessions, 'text');
    }

    // For MVP, return text directly
    // In production, store file and return download URL
    res.status(200).json({
      export_id: require('uuid').v4(),
      status: 'completed',
      format: exportData.format,
      filename: exportData.filename,
      content: exportData.content, // In production, this would be a download URL
      size_bytes: Buffer.byteLength(exportData.content, 'utf8')
    });
  } catch (error) {
    next(error);
  }
};

// Get export status
exports.getExportStatus = async (req, res, next) => {
  try {
    const { export_id } = req.params;

    // TODO: Implement export status check
    res.status(200).json({
      export_id,
      status: 'completed',
      download_url: `/api/v1/journal/export/${export_id}/download`,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      file_size_bytes: 0
    });
  } catch (error) {
    next(error);
  }
};

// Download export
exports.downloadExport = async (req, res, next) => {
  try {
    const { export_id } = req.params;

    // TODO: Implement file download
    res.status(200).send('Export file content');
  } catch (error) {
    next(error);
  }
};

// Delete journal entry
exports.deleteEntry = async (req, res, next) => {
  try {
    const { session_id } = req.params;
    const user_id = req.user.id;

    const session = await Session.findOne({
      where: { id: session_id, user_id }
    });

    if (!session) {
      return res.status(404).json({
        error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' }
      });
    }

    // Delete associated messages
    await Message.destroy({ where: { session_id } });

    // Delete session
    await session.destroy();

    res.status(200).json({
      session_id,
      deleted_at: new Date()
    });
  } catch (error) {
    next(error);
  }
};

