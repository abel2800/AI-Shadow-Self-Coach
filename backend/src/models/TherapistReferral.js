const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const TherapistReferral = sequelize.define('TherapistReferral', {
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
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'matched', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  preferences: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'User preferences: insurance, location, specialties, etc.'
  },
  consent_for_contact: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  matched_therapist_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'External therapist ID from referral service'
  },
  matched_therapist_info: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Therapist contact information and details'
  },
  estimated_response: {
    type: DataTypes.DATE,
    allowNull: true
  },
  responded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'therapist_referrals',
  timestamps: true,
  underscored: true
});

// Associations
TherapistReferral.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(TherapistReferral, { foreignKey: 'user_id' });

module.exports = TherapistReferral;

