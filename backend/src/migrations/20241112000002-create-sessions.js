/**
 * Migration: Create Sessions Table
 * Creates the sessions table with all required fields
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      session_type: {
        type: Sequelize.ENUM('check-in', 'gentle_deep', 'micro_practice'),
        allowNull: false
      },
      state: {
        type: Sequelize.ENUM('active', 'paused', 'completed'),
        defaultValue: 'active'
      },
      mood_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 10
        }
      },
      summary: {
        type: Sequelize.JSONB,
        defaultValue: null
      },
      started_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      ended_at: {
        type: Sequelize.DATE,
        defaultValue: null
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes (if they don't exist)
    try {
      await queryInterface.addIndex('sessions', ['user_id'], {
        name: 'idx_sessions_user_id'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('sessions', ['state'], {
        name: 'idx_sessions_state'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('sessions', ['started_at'], {
        name: 'idx_sessions_started_at'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sessions');
  }
};

