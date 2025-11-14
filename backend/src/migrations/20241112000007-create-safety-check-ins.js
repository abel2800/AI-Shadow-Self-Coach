'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('safety_check_ins', {
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
      session_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'sessions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      safety_status: {
        type: Sequelize.ENUM('safe', 'unsure', 'needs_support'),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      next_check_in: {
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
    await queryInterface.addIndex('safety_check_ins', ['user_id'], {
      name: 'safety_check_ins_user_id_idx',
    });
    await queryInterface.addIndex('safety_check_ins', ['session_id'], {
      name: 'safety_check_ins_session_id_idx',
    });
    await queryInterface.addIndex('safety_check_ins', ['safety_status'], {
      name: 'safety_check_ins_safety_status_idx',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('safety_check_ins');
  }
};

