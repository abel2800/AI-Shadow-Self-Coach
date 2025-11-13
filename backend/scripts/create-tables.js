/**
 * Create Tables Script
 * Creates database tables using raw SQL
 * Alternative to Sequelize sync
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');

const createTablesSQL = `
-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  preferences JSONB DEFAULT '{"session_length": "medium", "notifications_enabled": true}'::jsonb,
  consent_for_research BOOLEAN DEFAULT false,
  safety_contact JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('check-in', 'gentle_deep', 'micro_practice')),
  state VARCHAR(50) DEFAULT 'active' CHECK (state IN ('active', 'paused', 'completed')),
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  summary JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
  text TEXT NOT NULL,
  intent VARCHAR(50) DEFAULT 'other' CHECK (intent IN ('validate', 'probe_story', 'probe_root', 'reframe', 'suggest_experiment', 'offer_mindfulness', 'safety_check', 'emergency', 'close', 'other')),
  sentiment VARCHAR(50) DEFAULT 'neutral' CHECK (sentiment IN ('very_negative', 'negative', 'neutral', 'positive')),
  risk_level VARCHAR(50) DEFAULT 'none' CHECK (risk_level IN ('none', 'low', 'medium', 'high')),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_state ON sessions(state);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_risk_level ON messages(risk_level);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function createTables() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    console.log('🔄 Creating database tables...');
    
    // Execute SQL to create tables
    await sequelize.query(createTablesSQL);
    
    console.log('✅ Database tables created successfully!');
    console.log('');
    console.log('📊 Created tables:');
    console.log('  - users');
    console.log('  - sessions');
    console.log('  - messages');
    console.log('');
    console.log('📊 Created indexes:');
    console.log('  - idx_sessions_user_id');
    console.log('  - idx_sessions_state');
    console.log('  - idx_sessions_started_at');
    console.log('  - idx_messages_session_id');
    console.log('  - idx_messages_timestamp');
    console.log('  - idx_messages_risk_level');
    console.log('');
    
    // Close connection
    await sequelize.close();
    console.log('✅ Database connection closed.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    if (error.original) {
      console.error('   Original error:', error.original.message);
    }
    process.exit(1);
  }
}

// Run table creation
createTables();

