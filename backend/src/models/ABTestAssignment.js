/**
 * A/B Test Assignment Model
 * Tracks which users are assigned to which test variants
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const ABTest = require('./ABTest');

const ABTestAssignment = sequelize.define('ABTestAssignment', {
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
  ab_test_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: ABTest,
      key: 'id'
    }
  },
  variant: {
    type: DataTypes.ENUM('a', 'b'),
    allowNull: false
  },
  assigned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'ab_test_assignments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'ab_test_id']
    }
  ]
});

// Associations
ABTestAssignment.belongsTo(User, { foreignKey: 'user_id' });
ABTestAssignment.belongsTo(ABTest, { foreignKey: 'ab_test_id' });

module.exports = ABTestAssignment;

