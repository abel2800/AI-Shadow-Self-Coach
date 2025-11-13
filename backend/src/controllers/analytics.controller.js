const { Session, Message, Mood } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Submit mood score
exports.submitMood = async (req, res, next) => {
  try {
    const { mood_score, timestamp, notes } = req.body;
    const user_id = req.user.id;

    // Validate mood score
    if (!mood_score || mood_score < 1 || mood_score > 10) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_OUT_OF_RANGE',
          message: 'Mood score must be between 1 and 10'
        }
      });
    }

    // Create Mood record
    const mood = await Mood.create({
      id: uuidv4(),
      user_id,
      mood_score,
      notes: notes || null,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    res.status(201).json({
      mood_id: mood.id,
      mood_score: mood.mood_score,
      notes: mood.notes,
      timestamp: mood.timestamp,
      created_at: mood.created_at
    });
  } catch (error) {
    next(error);
  }
};

// Get mood history
exports.getMoodHistory = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { start_date, end_date, granularity = 'day' } = req.query;

    const where = { user_id };
    if (start_date) where.timestamp = { [Op.gte]: new Date(start_date) };
    if (end_date) {
      if (!where.timestamp) where.timestamp = {};
      where.timestamp[Op.lte] = new Date(end_date);
    }

    const moods = await Mood.findAll({
      where,
      attributes: ['mood_score', 'timestamp'],
      order: [['timestamp', 'ASC']]
    });

    // Group by granularity
    const moodScores = moods.map(m => ({
      date: m.timestamp.toISOString().split('T')[0],
      score: m.mood_score
    }));

    // Calculate statistics
    const scores = moodScores.map(m => m.score);
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const min = scores.length > 0 ? Math.min(...scores) : 0;
    const max = scores.length > 0 ? Math.max(...scores) : 0;

    res.status(200).json({
      mood_scores: moodScores,
      statistics: {
        average: Math.round(average * 10) / 10,
        min,
        max,
        trend: 'stable' // TODO: Calculate actual trend
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get insights analytics
exports.getInsights = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { start_date, end_date } = req.query;

    const where = { user_id, state: 'completed' };
    if (start_date) where.started_at = { [Op.gte]: new Date(start_date) };
    if (end_date) {
      if (!where.started_at) where.started_at = {};
      where.started_at[Op.lte] = new Date(end_date);
    }

    const sessions = await Session.findAll({ where });

    // Count insights (highlights)
    const totalInsights = 0; // TODO: Count from highlights table

    // Tag distribution
    const tagCounts = {};
    sessions.forEach(session => {
      const tags = session.summary?.tags || [];
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Session type distribution
    const sessionTypes = {
      'check-in': 0,
      'gentle_deep': 0,
      'micro_practice': 0
    };
    sessions.forEach(session => {
      sessionTypes[session.session_type] = (sessionTypes[session.session_type] || 0) + 1;
    });

    res.status(200).json({
      insight_frequency: {
        total: totalInsights,
        by_week: [] // TODO: Calculate by week
      },
      tag_distribution: Object.entries(tagCounts).map(([tag, count]) => ({
        tag,
        count
      })),
      session_types: sessionTypes
    });
  } catch (error) {
    next(error);
  }
};

// Get overall progress
exports.getProgress = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { start_date, end_date } = req.query;

    const where = { user_id, state: 'completed' };
    if (start_date) where.started_at = { [Op.gte]: new Date(start_date) };
    if (end_date) {
      if (!where.started_at) where.started_at = {};
      where.started_at[Op.lte] = new Date(end_date);
    }

    const sessions = await Session.findAll({ where });

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    
    const moodScores = sessions
      .filter(s => s.mood_score)
      .map(s => s.mood_score);
    const averageMood = moodScores.length > 0
      ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length
      : 0;

    const insightsCount = 0; // TODO: Count from highlights
    const experimentsCompleted = sessions.filter(s => 
      s.summary?.experiment
    ).length;

    res.status(200).json({
      user_id,
      period: {
        start: start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: end_date || new Date().toISOString()
      },
      summary: {
        total_sessions: totalSessions,
        total_duration_minutes: totalDuration,
        average_mood: Math.round(averageMood * 10) / 10,
        mood_trend: 'stable', // TODO: Calculate trend
        insights_count: insightsCount,
        experiments_completed: experimentsCompleted
      },
      trends: {
        mood: 'stable', // TODO: Calculate
        session_frequency: 'stable', // TODO: Calculate
        engagement: 'stable' // TODO: Calculate
      }
    });
  } catch (error) {
    next(error);
  }
};

