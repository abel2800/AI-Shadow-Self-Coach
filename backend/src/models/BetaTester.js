const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const BetaTester = sequelize.define('BetaTester', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  cohort: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'general',
    comment: 'Beta testing cohort (e.g., early_access, general, control)'
  },
  enrolled_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'completed', 'withdrawn'),
    allowNull: false,
    defaultValue: 'active'
  },
  feedback_consent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Consent to provide feedback and participate in surveys'
  },
  test_group: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'A/B test group assignment'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Internal notes about the beta tester'
  }
}, {
  tableName: 'beta_testers',
  timestamps: true,
  underscored: true
});

// Associations
BetaTester.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(BetaTester, { foreignKey: 'user_id' });

module.exports = BetaTester;

