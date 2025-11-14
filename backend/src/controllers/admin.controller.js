const { BetaFeedback, BetaTester, User, Session, SafetyCheckIn, TherapistReferral } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Get system statistics (admin only)
 */
exports.getSystemStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalSessions,
      completedSessions,
      totalFeedback,
      pendingFeedback,
      totalCheckIns,
      highRiskCheckIns,
      totalReferrals,
      activeReferrals
    ] = await Promise.all([
      User.count(),
      User.count({ where: { is_active: true } }),
      Session.count(),
      Session.count({ where: { state: 'completed' } }),
      BetaFeedback.count(),
      BetaFeedback.count({ where: { status: 'new' } }),
      SafetyCheckIn.count(),
      SafetyCheckIn.count({ where: { safety_status: 'needs_support' } }),
      TherapistReferral.count(),
      TherapistReferral.count({ where: { status: { [Op.in]: ['pending', 'processing'] } } })
    ]);

    res.status(200).json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        completion_rate: totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(2) : 0
      },
      beta_testing: {
        total_feedback: totalFeedback,
        pending_feedback: pendingFeedback,
        feedback_resolution_rate: totalFeedback > 0 ? ((totalFeedback - pendingFeedback) / totalFeedback * 100).toFixed(2) : 0
      },
      safety: {
        total_check_ins: totalCheckIns,
        high_risk_check_ins: highRiskCheckIns,
        referrals: {
          total: totalReferrals,
          active: activeReferrals
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get beta feedback list (admin only)
 */
exports.getBetaFeedback = async (req, res, next) => {
  try {
    const { 
      status, 
      feedback_type, 
      priority, 
      limit = 50, 
      offset = 0,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (feedback_type) where.feedback_type = feedback_type;
    if (priority) where.priority = priority;

    const order = [[sort_by, sort_order.toUpperCase()]];

    const result = await BetaFeedback.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      include: [{
        model: User,
        attributes: ['id', 'email'],
        required: false
      }, {
        model: BetaTester,
        attributes: ['id', 'cohort'],
        required: false
      }]
    });

    res.status(200).json({
      feedback: result.rows.map(f => ({
        feedback_id: f.id,
        user_id: f.user_id,
        user_email: f.User?.email,
        beta_tester_id: f.beta_tester_id,
        cohort: f.BetaTester?.cohort,
        feedback_type: f.feedback_type,
        category: f.category,
        rating: f.rating,
        title: f.title,
        content: f.content,
        status: f.status,
        priority: f.priority,
        assigned_to: f.assigned_to,
        response: f.response,
        responded_at: f.responded_at,
        created_at: f.created_at,
        metadata: f.metadata
      })),
      total: result.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update beta feedback status (admin only)
 */
exports.updateBetaFeedback = async (req, res, next) => {
  try {
    const { feedback_id } = req.params;
    const { status, priority, assigned_to, response } = req.body;

    const feedback = await BetaFeedback.findByPk(feedback_id);

    if (!feedback) {
      return res.status(404).json({
        error: {
          code: 'FEEDBACK_NOT_FOUND',
          message: 'Feedback not found'
        }
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (response) {
      updateData.response = response;
      updateData.responded_at = new Date();
    }

    await feedback.update(updateData);

    res.status(200).json({
      feedback_id: feedback.id,
      status: feedback.status,
      priority: feedback.priority,
      assigned_to: feedback.assigned_to,
      responded_at: feedback.responded_at,
      updated_at: feedback.updated_at
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get beta tester statistics (admin only)
 */
exports.getBetaTesterStats = async (req, res, next) => {
  try {
    const stats = await BetaTester.findAll({
      attributes: [
        'cohort',
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('BetaTester.id')), 'count']
      ],
      group: ['cohort', 'status'],
      raw: true
    });

    const cohortStats = {};
    const statusStats = {};

    stats.forEach(stat => {
      const cohort = stat.cohort || 'unknown';
      const status = stat.status || 'unknown';
      const count = parseInt(stat.count);

      if (!cohortStats[cohort]) {
        cohortStats[cohort] = { total: 0, by_status: {} };
      }
      cohortStats[cohort].total += count;
      cohortStats[cohort].by_status[status] = count;

      if (!statusStats[status]) {
        statusStats[status] = 0;
      }
      statusStats[status] += count;
    });

    res.status(200).json({
      by_cohort: cohortStats,
      by_status: statusStats,
      total: Object.values(statusStats).reduce((a, b) => a + b, 0)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get safety statistics (admin only)
 */
exports.getSafetyStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const where = {};
    if (start_date) where.created_at = { [Op.gte]: new Date(start_date) };
    if (end_date) {
      if (!where.created_at) where.created_at = {};
      where.created_at[Op.lte] = new Date(end_date);
    }

    const checkIns = await SafetyCheckIn.findAll({
      where,
      attributes: [
        'safety_status',
        [require('sequelize').fn('COUNT', require('sequelize').col('SafetyCheckIn.id')), 'count']
      ],
      group: ['safety_status'],
      raw: true
    });

    const statusCounts = {};
    checkIns.forEach(ci => {
      statusCounts[ci.safety_status] = parseInt(ci.count);
    });

    const referrals = await TherapistReferral.findAll({
      where,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('TherapistReferral.id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const referralCounts = {};
    referrals.forEach(r => {
      referralCounts[r.status] = parseInt(r.count);
    });

    res.status(200).json({
      check_ins: {
        by_status: statusCounts,
        total: Object.values(statusCounts).reduce((a, b) => a + b, 0)
      },
      referrals: {
        by_status: referralCounts,
        total: Object.values(referralCounts).reduce((a, b) => a + b, 0)
      },
      period: {
        start: start_date || null,
        end: end_date || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user activity statistics (admin only)
 */
exports.getUserActivityStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [
      newUsers,
      activeUsers,
      sessionsCreated,
      sessionsCompleted,
      messagesSent
    ] = await Promise.all([
      User.count({
        where: {
          created_at: { [Op.gte]: startDate }
        }
      }),
      User.count({
        where: {
          last_login: { [Op.gte]: startDate }
        }
      }),
      Session.count({
        where: {
          created_at: { [Op.gte]: startDate }
        }
      }),
      Session.count({
        where: {
          completed_at: { [Op.gte]: startDate }
        }
      }),
      require('../models').Message.count({
        where: {
          created_at: { [Op.gte]: startDate },
          role: 'user'
        }
      })
    ]);

    res.status(200).json({
      period_days: parseInt(days),
      period_start: startDate.toISOString(),
      users: {
        new: newUsers,
        active: activeUsers
      },
      sessions: {
        created: sessionsCreated,
        completed: sessionsCompleted,
        completion_rate: sessionsCreated > 0 ? (sessionsCompleted / sessionsCreated * 100).toFixed(2) : 0
      },
      engagement: {
        messages_sent: messagesSent,
        avg_messages_per_user: activeUsers > 0 ? (messagesSent / activeUsers).toFixed(2) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

