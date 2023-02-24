'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('GamePieces', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        gameId: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        gamePlayerId: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        playerUnitId: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        positionX: {
          type: Sequelize.INTEGER
        },
        positionY: {
          type: Sequelize.INTEGER
        },
        health: {
          allowNull: false,
          type: Sequelize.INTEGER
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
        'GamePieces',
        { fields: ['gameId'] },
        { transaction }
      );
      await queryInterface.addIndex(
        'GamePieces',
        { fields: ['gamePlayerId'] },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GamePieces');
  }
};