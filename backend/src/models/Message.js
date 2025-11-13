const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Session = require('./Session');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  session_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Session,
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'assistant'),
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  intent: {
    type: DataTypes.ENUM(
      'validate',
      'probe_story',
      'probe_root',
      'reframe',
      'suggest_experiment',
      'offer_mindfulness',
      'safety_check',
      'emergency',
      'close',
      'other'
    ),
    defaultValue: 'other'
  },
  sentiment: {
    type: DataTypes.ENUM('very_negative', 'negative', 'neutral', 'positive'),
    defaultValue: 'neutral'
  },
  risk_level: {
    type: DataTypes.ENUM('none', 'low', 'medium', 'high'),
    defaultValue: 'none'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'messages',
  timestamps: true,
  underscored: true // Use snake_case for column names
});

// Associations
Message.belongsTo(Session, { foreignKey: 'session_id' });
Session.hasMany(Message, { foreignKey: 'session_id' });

module.exports = Message;

