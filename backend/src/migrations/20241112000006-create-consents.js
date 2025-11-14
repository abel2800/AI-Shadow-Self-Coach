'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create consents table
    await queryInterface.createTable('consents', {
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      consent_type: {
        type: Sequelize.ENUM('research', 'data_processing', 'analytics', 'third_party'),
        allowNull: false
      },
      granted: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      consent_text: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      version: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '1.0'
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      user_agent: {
        type: Sequelize.STRING,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
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

    // Create indexes
    try {
      await queryInterface.addIndex('consents', ['user_id', 'consent_type'], {
        name: 'idx_consents_user_type'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('consents', ['user_id', 'created_at'], {
        name: 'idx_consents_user_date'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('consents');
  }
};

