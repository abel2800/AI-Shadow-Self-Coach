/**
 * Migration: Add Updated At Trigger Function
 * Creates a PostgreSQL function to automatically update updated_at timestamp
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the function if it doesn't exist
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Add triggers to all tables
    const tables = ['users', 'sessions', 'messages', 'moods'];
    
    for (const table of tables) {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove triggers
    const tables = ['users', 'sessions', 'messages', 'moods'];
    
    for (const table of tables) {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
      `);
    }

    // Drop the function
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS update_updated_at_column();
    `);
  }
};

