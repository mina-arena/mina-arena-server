'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('Games', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        status: {
          allowNull: false,
          type: Sequelize.ENUM('pending', 'inProgress', 'completed', 'canceled')
        },
        turnNumber: {
          type: Sequelize.INTEGER
        },
        phase: {
          type: Sequelize.ENUM('movement', 'shooting', 'melee')
        },
        turnPlayerOrder: {
          type: Sequelize.STRING
        },
        turnGamePlayerId: {
          type: Sequelize.INTEGER
        },
        winningGamePlayerId: {
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
        'Games',
        { fields: ['status'] },
        { transaction }
      );
      await queryInterface.addIndex(
        'Games',
        { fields: ['winningGamePlayerId'] },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Games');
  }
};