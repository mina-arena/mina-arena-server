'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('GamePhases', {
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
        turnNumber: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        phase: {
          allowNull: false,
          type: Sequelize.ENUM('movement', 'shooting', 'melee')
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
        'GamePhases',
        { fields: ['gameId'] },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GamePhases');
  }
};