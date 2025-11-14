/**
 * A/B Test Model
 * Tracks A/B tests for model versions
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ABTest = sequelize.define('ABTest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  model_type: {
    type: DataTypes.ENUM('safety_classifier', 'intent_classifier', 'persona_model'),
    allowNull: false
  },
  variant_a: {
    type: DataTypes.STRING, // Model version for variant A
    allowNull: false
  },
  variant_b: {
    type: DataTypes.STRING, // Model version for variant B
    allowNull: false
  },
  traffic_split: {
    type: DataTypes.JSONB, // { a: 0.5, b: 0.5 }
    defaultValue: { a: 0.5, b: 0.5 }
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'completed'),
    defaultValue: 'draft'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metrics: {
    type: DataTypes.JSONB,
    defaultValue: {
      variant_a: { requests: 0, errors: 0, avg_latency: 0 },
      variant_b: { requests: 0, errors: 0, avg_latency: 0 }
    }
  },
  criteria: {
    type: DataTypes.JSONB, // Success criteria for test
    defaultValue: {}
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'ab_tests',
  timestamps: true,
  underscored: true
});

module.exports = ABTest;

