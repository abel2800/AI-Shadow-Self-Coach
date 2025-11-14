'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('beta_feedback', {
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
      beta_tester_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'beta_testers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      feedback_type: {
        type: Sequelize.ENUM('survey', 'bug_report', 'feature_request', 'general', 'session_feedback'),
        allowNull: false,
        defaultValue: 'general',
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('new', 'reviewed', 'in_progress', 'resolved', 'closed'),
        allowNull: false,
        defaultValue: 'new',
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: true,
        defaultValue: 'medium',
      },
      assigned_to: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      response: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      responded_at: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('beta_feedback', ['user_id'], {
      name: 'beta_feedback_user_id_idx',
    });
    await queryInterface.addIndex('beta_feedback', ['beta_tester_id'], {
      name: 'beta_feedback_beta_tester_id_idx',
    });
    await queryInterface.addIndex('beta_feedback', ['feedback_type'], {
      name: 'beta_feedback_feedback_type_idx',
    });
    await queryInterface.addIndex('beta_feedback', ['status'], {
      name: 'beta_feedback_status_idx',
    });
    await queryInterface.addIndex('beta_feedback', ['created_at'], {
      name: 'beta_feedback_created_at_idx',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('beta_feedback');
  }
};

