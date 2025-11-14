const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Session = require('./Session');

const SafetyCheckIn = sequelize.define('SafetyCheckIn', {
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
  session_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Session,
      key: 'id'
    }
  },
  safety_status: {
    type: DataTypes.ENUM('safe', 'unsure', 'needs_support'),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  next_check_in: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'safety_check_ins',
  timestamps: true,
  underscored: true
});

// Associations
SafetyCheckIn.belongsTo(User, { foreignKey: 'user_id' });
SafetyCheckIn.belongsTo(Session, { foreignKey: 'session_id' });
User.hasMany(SafetyCheckIn, { foreignKey: 'user_id' });
Session.hasMany(SafetyCheckIn, { foreignKey: 'session_id' });

module.exports = SafetyCheckIn;

