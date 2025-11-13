/**
 * Migration: Create Messages Table
 * Creates the messages table with all required fields
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      session_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sessions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('user', 'assistant'),
        allowNull: false
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: null
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
      await queryInterface.addIndex('messages', ['session_id'], {
        name: 'idx_messages_session_id'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('messages', ['timestamp'], {
        name: 'idx_messages_timestamp'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('messages', ['role'], {
        name: 'idx_messages_role'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
  }
};

