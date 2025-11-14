'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ab_tests table
    await queryInterface.createTable('ab_tests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      model_type: {
        type: Sequelize.ENUM('safety_classifier', 'intent_classifier', 'persona_model'),
        allowNull: false
      },
      variant_a: {
        type: Sequelize.STRING,
        allowNull: false
      },
      variant_b: {
        type: Sequelize.STRING,
        allowNull: false
      },
      traffic_split: {
        type: Sequelize.JSONB,
        defaultValue: { a: 0.5, b: 0.5 }
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'paused', 'completed'),
        defaultValue: 'draft'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metrics: {
        type: Sequelize.JSONB,
        defaultValue: {
          variant_a: { requests: 0, errors: 0, avg_latency: 0 },
          variant_b: { requests: 0, errors: 0, avg_latency: 0 }
        }
      },
      criteria: {
        type: Sequelize.JSONB,
        defaultValue: {}
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

    // Create ab_test_assignments table
    await queryInterface.createTable('ab_test_assignments', {
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
      ab_test_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'ab_tests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      variant: {
        type: Sequelize.ENUM('a', 'b'),
        allowNull: false
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
      await queryInterface.addIndex('ab_test_assignments', ['user_id', 'ab_test_id'], {
        unique: true,
        name: 'idx_ab_test_assignments_user_test'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('ab_test_assignments', ['ab_test_id'], {
        name: 'idx_ab_test_assignments_test_id'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    try {
      await queryInterface.addIndex('ab_tests', ['model_type', 'status'], {
        name: 'idx_ab_tests_model_status'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ab_test_assignments');
    await queryInterface.dropTable('ab_tests');
  }
};

