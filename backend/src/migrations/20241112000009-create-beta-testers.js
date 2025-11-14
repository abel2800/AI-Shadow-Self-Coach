'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('beta_testers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cohort: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'general',
      },
      enrolled_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.ENUM('active', 'paused', 'completed', 'withdrawn'),
        allowNull: false,
        defaultValue: 'active',
      },
      feedback_consent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      test_group: {
        type: Sequelize.STRING,
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
    await queryInterface.addIndex('beta_testers', ['user_id'], {
      name: 'beta_testers_user_id_idx',
      unique: true,
    });
    await queryInterface.addIndex('beta_testers', ['cohort'], {
      name: 'beta_testers_cohort_idx',
    });
    await queryInterface.addIndex('beta_testers', ['status'], {
      name: 'beta_testers_status_idx',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('beta_testers');
  }
};

