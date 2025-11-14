// Models index file
const User = require('./User');
const Session = require('./Session');
const Message = require('./Message');
const Mood = require('./Mood');
const ABTest = require('./ABTest');
const ABTestAssignment = require('./ABTestAssignment');
const Consent = require('./Consent');
const SafetyCheckIn = require('./SafetyCheckIn');
const TherapistReferral = require('./TherapistReferral');
const BetaTester = require('./BetaTester');
const BetaFeedback = require('./BetaFeedback');

// Initialize associations
require('./Session'); // This will set up associations
require('./Message'); // This will set up associations
require('./Mood'); // This will set up associations
require('./ABTestAssignment'); // This will set up associations
require('./Consent'); // This will set up associations
require('./SafetyCheckIn'); // This will set up associations
require('./TherapistReferral'); // This will set up associations
require('./BetaTester'); // This will set up associations
require('./BetaFeedback'); // This will set up associations

module.exports = {
  User,
  Session,
  Message,
  Mood,
  ABTest,
  ABTestAssignment,
  Consent,
  SafetyCheckIn,
  TherapistReferral,
  BetaTester,
  BetaFeedback
};

