// Models index file
const User = require('./User');
const Session = require('./Session');
const Message = require('./Message');
const Mood = require('./Mood');
const ABTest = require('./ABTest');
const ABTestAssignment = require('./ABTestAssignment');

// Initialize associations
require('./Session'); // This will set up associations
require('./Message'); // This will set up associations
require('./Mood'); // This will set up associations
require('./ABTestAssignment'); // This will set up associations

module.exports = {
  User,
  Session,
  Message,
  Mood,
  ABTest,
  ABTestAssignment
};

