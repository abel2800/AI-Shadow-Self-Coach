const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Session = sequelize.define('Session', {
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
  session_type: {
    type: DataTypes.ENUM('check-in', 'gentle_deep', 'micro_practice'),
    allowNull: false
  },
  state: {
    type: DataTypes.ENUM('active', 'paused', 'completed'),
    defaultValue: 'active'
  },
  mood_score: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 10
    }
  },
  summary: {
    type: DataTypes.JSONB,
    defaultValue: null
  },
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ended_at: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'sessions',
  timestamps: true,
  underscored: true // Use snake_case for column names
});

// Associations
Session.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Session, { foreignKey: 'user_id' });

module.exports = Session;

