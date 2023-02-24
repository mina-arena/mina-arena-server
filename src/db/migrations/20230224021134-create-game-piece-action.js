'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('GamePieceActions', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        gamePhaseId: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        gamePlayerId: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        gamePieceId: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        actionType: {
          allowNull: false,
          type: Sequelize.ENUM('move', 'rangedAttack', 'meleeAttack')
        },
        actionData: {
          allowNull: false,
          type: Sequelize.JSONB
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });
      await queryInterface.addIndex(
        'GamePieceActions',
        { fields: ['gamePhaseId'] },
        { transaction }
      );
      await queryInterface.addIndex(
        'GamePieceActions',
        { fields: ['gamePlayerId'] },
        { transaction }
      );
      await queryInterface.addIndex(
        'GamePieceActions',
        { fields: ['gamePieceId'] },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GamePieceActions');
  }
};