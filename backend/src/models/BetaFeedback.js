const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const BetaTester = require('./BetaTester');

const BetaFeedback = sequelize.define('BetaFeedback', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  beta_tester_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: BetaTester,
      key: 'id'
    }
  },
  feedback_type: {
    type: DataTypes.ENUM('survey', 'bug_report', 'feature_request', 'general', 'session_feedback'),
    allowNull: false,
    defaultValue: 'general'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Category: ui, ai_response, performance, safety, etc.'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Rating from 1-5 (if applicable)'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional context: app version, device info, session_id, etc.'
  },
  status: {
    type: DataTypes.ENUM('new', 'reviewed', 'in_progress', 'resolved', 'closed'),
    allowNull: false,
    defaultValue: 'new'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: true,
    defaultValue: 'medium'
  },
  assigned_to: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Team member assigned to handle this feedback'
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Response from team to the beta tester'
  },
  responded_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'beta_feedback',
  timestamps: true,
  underscored: true
});

// Associations
BetaFeedback.belongsTo(User, { foreignKey: 'user_id' });
BetaFeedback.belongsTo(BetaTester, { foreignKey: 'beta_tester_id' });
User.hasMany(BetaFeedback, { foreignKey: 'user_id' });
BetaTester.hasMany(BetaFeedback, { foreignKey: 'beta_tester_id' });

module.exports = BetaFeedback;

