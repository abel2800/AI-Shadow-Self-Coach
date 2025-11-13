/**
 * Migration: Create Moods Table
 * Creates the moods table for mood tracking
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('moods', {
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
      mood_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 10
        }
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
      await queryInterface.addIndex('moods', ['user_id'], {
        name: 'idx_moods_user_id'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('moods', ['timestamp'], {
        name: 'idx_moods_timestamp'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('moods');
  }
};

