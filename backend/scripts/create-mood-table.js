/**
 * Create Mood Table Script
 * Adds mood tracking table to database
 */

require('dotenv').config();
const { sequelize } = require('../src/config/database');

const createMoodTableSQL = `
-- Create Moods table
CREATE TABLE IF NOT EXISTS moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id);
CREATE INDEX IF NOT EXISTS idx_moods_timestamp ON moods(timestamp);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_moods_updated_at ON moods;
CREATE TRIGGER update_moods_updated_at BEFORE UPDATE ON moods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function createMoodTable() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    console.log('🔄 Creating moods table...');
    await sequelize.query(createMoodTableSQL);
    
    console.log('✅ Moods table created successfully!');
    
    await sequelize.close();
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating moods table:', error.message);
    if (error.original) {
      console.error('   Original error:', error.original.message);
    }
    process.exit(1);
  }
}

createMoodTable();

