#!/usr/bin/env node
/**
 * Seed Test Data Script
 * Populates database with test data for development
 */

const { User, Session, Message, Mood, Consent } = require('../src/models');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const logger = require('../src/utils/logger');

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...\n');
    
    // Create test users
    const users = [];
    const testUsers = [
      { email: 'test@example.com', password: 'password123' },
      { email: 'user1@example.com', password: 'password123' },
      { email: 'user2@example.com', password: 'password123' }
    ];
    
    for (const userData of testUsers) {
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          id: uuidv4(),
          email: userData.email,
          password: await bcrypt.hash(userData.password, 10),
          preferences: {
            session_length: 'medium',
            notifications_enabled: true
          },
          consent_for_research: true,
          is_active: true
        }
      });
      
      users.push(user);
      console.log(`${created ? '✅ Created' : '⏭️  Exists'}: ${user.email}`);
    }
    
    // Create test sessions
    const sessions = [];
    for (const user of users) {
      const sessionTypes = ['check-in', 'gentle_deep', 'micro_practice'];
      const sessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
      
      const session = await Session.create({
        id: uuidv4(),
        user_id: user.id,
        session_type: sessionType,
        state: Math.random() > 0.5 ? 'completed' : 'active',
        mood_score: Math.floor(Math.random() * 10) + 1,
        started_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
        ended_at: Math.random() > 0.5 ? new Date() : null
      });
      
      sessions.push(session);
      
      // Create messages for session
      const messages = [
        { role: 'user', text: 'I\'ve been feeling stressed lately.' },
        { role: 'assistant', text: 'That sounds difficult — I\'m sorry you\'re carrying that. Would you like to explore what\'s underneath that stress?', intent: 'validate', sentiment: 'negative', risk_level: 'none' },
        { role: 'user', text: 'Yes, I think so.' },
        { role: 'assistant', text: 'Thank you. Can you tell me about the most recent time you felt stressed?', intent: 'probe_story', sentiment: 'negative', risk_level: 'none' }
      ];
      
      for (let i = 0; i < messages.length; i++) {
        await Message.create({
          id: uuidv4(),
          session_id: session.id,
          role: messages[i].role,
          text: messages[i].text,
          intent: messages[i].intent || null,
          sentiment: messages[i].sentiment || null,
          risk_level: messages[i].risk_level || null,
          timestamp: new Date(session.started_at.getTime() + i * 30000) // 30 seconds apart
        });
      }
      
      console.log(`✅ Created session for ${user.email} (${sessionType})`);
    }
    
    // Create test moods
    for (const user of users) {
      for (let i = 0; i < 5; i++) {
        await Mood.create({
          id: uuidv4(),
          user_id: user.id,
          mood_score: Math.floor(Math.random() * 10) + 1,
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Last 5 days
          notes: i === 0 ? 'Feeling okay today' : null
        });
      }
      console.log(`✅ Created mood entries for ${user.email}`);
    }
    
    // Create test consents
    for (const user of users) {
      await Consent.create({
        id: uuidv4(),
        user_id: user.id,
        consent_type: 'research',
        granted: true,
        version: '1.0',
        consent_text: 'I consent to anonymized data being used for research.',
        metadata: {}
      });
      console.log(`✅ Created consent for ${user.email}`);
    }
    
    console.log('\n✅ Test data seeding complete!');
    console.log('\n📋 Test Accounts:');
    testUsers.forEach(user => {
      console.log(`   Email: ${user.email}, Password: ${user.password}`);
    });
    
    process.exit(0);
  } catch (error) {
    logger.error('Test data seeding failed:', error);
    console.error('❌ Test data seeding failed:', error.message);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  seedTestData();
}

module.exports = { seedTestData };

