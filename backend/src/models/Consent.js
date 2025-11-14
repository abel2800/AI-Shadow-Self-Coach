/**
 * Consent Model
 * Tracks user consent history for research data collection
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Consent = sequelize.define('Consent', {
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
  consent_type: {
    type: DataTypes.ENUM('research', 'data_processing', 'analytics', 'third_party'),
    allowNull: false
  },
  granted: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  consent_text: {
    type: DataTypes.TEXT,
    allowNull: true // Store the consent text that was shown
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '1.0' // Track consent policy version
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true // For audit purposes
  },
  user_agent: {
    type: DataTypes.STRING,
    allowNull: true // For audit purposes
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'consents',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id', 'consent_type']
    },
    {
      fields: ['user_id', 'created_at']
    }
  ]
});

// Associations
Consent.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Consent, { foreignKey: 'user_id' });

module.exports = Consent;

