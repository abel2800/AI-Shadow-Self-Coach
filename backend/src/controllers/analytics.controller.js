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

    // Calculate trend (comparing first half vs second half)
    let trend = 'stable';
    if (scores.length >= 4) {
      const midpoint = Math.floor(scores.length / 2);
      const firstHalf = scores.slice(0, midpoint);
      const secondHalf = scores.slice(midpoint);
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const diff = secondAvg - firstAvg;
      
      if (diff > 0.5) trend = 'improving';
      else if (diff < -0.5) trend = 'declining';
    }

    res.status(200).json({
      mood_scores: moodScores,
      statistics: {
        average: Math.round(average * 10) / 10,
        min,
        max,
        trend
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

    // Count insights (highlights) from session summaries
    let totalInsights = 0;
    const insightsByWeek = {};
    
    sessions.forEach(session => {
      const highlights = session.summary?.highlights || [];
      totalInsights += highlights.length;
      
      // Group by week
      if (session.started_at) {
        const weekStart = new Date(session.started_at);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];
        insightsByWeek[weekKey] = (insightsByWeek[weekKey] || 0) + highlights.length;
      }
    });

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

    // Format insights by week
    const insightsByWeekArray = Object.entries(insightsByWeek)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));

    res.status(200).json({
      insight_frequency: {
        total: totalInsights,
        by_week: insightsByWeekArray
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

    // Count insights from session summaries
    const insightsCount = sessions.reduce((count, session) => {
      return count + (session.summary?.highlights?.length || 0);
    }, 0);

    const experimentsCompleted = sessions.filter(s => 
      s.summary?.experiment
    ).length;

    // Calculate mood trend
    let moodTrend = 'stable';
    if (moodScores.length >= 4) {
      const midpoint = Math.floor(moodScores.length / 2);
      const firstHalf = moodScores.slice(0, midpoint);
      const secondHalf = moodScores.slice(midpoint);
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const diff = secondAvg - firstAvg;
      
      if (diff > 0.5) moodTrend = 'improving';
      else if (diff < -0.5) moodTrend = 'declining';
    }

    // Calculate session frequency trend
    let sessionFrequencyTrend = 'stable';
    if (sessions.length >= 4) {
      const sortedSessions = [...sessions].sort((a, b) => 
        new Date(a.started_at) - new Date(b.started_at)
      );
      const midpoint = Math.floor(sortedSessions.length / 2);
      const firstHalf = sortedSessions.slice(0, midpoint);
      const secondHalf = sortedSessions.slice(midpoint);
      
      // Calculate sessions per week
      const firstPeriodDays = (new Date(firstHalf[firstHalf.length - 1].started_at) - 
        new Date(firstHalf[0].started_at)) / (1000 * 60 * 60 * 24) || 1;
      const secondPeriodDays = (new Date(secondHalf[secondHalf.length - 1].started_at) - 
        new Date(secondHalf[0].started_at)) / (1000 * 60 * 60 * 24) || 1;
      
      const firstRate = (firstHalf.length / firstPeriodDays) * 7; // per week
      const secondRate = (secondHalf.length / secondPeriodDays) * 7; // per week
      
      if (secondRate > firstRate * 1.2) sessionFrequencyTrend = 'increasing';
      else if (secondRate < firstRate * 0.8) sessionFrequencyTrend = 'decreasing';
    }

    // Calculate engagement trend (based on session duration and completion)
    let engagementTrend = 'stable';
    if (sessions.length >= 4) {
      const sortedSessions = [...sessions].sort((a, b) => 
        new Date(a.started_at) - new Date(b.started_at)
      );
      const midpoint = Math.floor(sortedSessions.length / 2);
      const firstHalf = sortedSessions.slice(0, midpoint);
      const secondHalf = sortedSessions.slice(midpoint);
      
      const firstAvgDuration = firstHalf.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / firstHalf.length;
      const secondAvgDuration = secondHalf.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / secondHalf.length;
      
      if (secondAvgDuration > firstAvgDuration * 1.2) engagementTrend = 'increasing';
      else if (secondAvgDuration < firstAvgDuration * 0.8) engagementTrend = 'decreasing';
    }

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
        mood_trend: moodTrend,
        insights_count: insightsCount,
        experiments_completed: experimentsCompleted
      },
      trends: {
        mood: moodTrend,
        session_frequency: sessionFrequencyTrend,
        engagement: engagementTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

