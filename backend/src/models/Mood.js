/**
 * Mood Model
 * Tracks user mood scores over time
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Mood = sequelize.define('Mood', {
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
  mood_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'moods',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['timestamp']
    }
  ]
});

// Associations
Mood.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Mood, { foreignKey: 'user_id' });

module.exports = Mood;

