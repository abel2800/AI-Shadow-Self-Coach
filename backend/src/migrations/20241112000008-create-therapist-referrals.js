'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('therapist_referrals', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'matched', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      preferences: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      consent_for_contact: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      matched_therapist_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      matched_therapist_info: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      estimated_response: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      responded_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('therapist_referrals', ['user_id'], {
      name: 'therapist_referrals_user_id_idx',
    });
    await queryInterface.addIndex('therapist_referrals', ['status'], {
      name: 'therapist_referrals_status_idx',
    });
    await queryInterface.addIndex('therapist_referrals', ['created_at'], {
      name: 'therapist_referrals_created_at_idx',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('therapist_referrals');
  }
};

