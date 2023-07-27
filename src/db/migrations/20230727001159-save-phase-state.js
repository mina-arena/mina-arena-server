'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'GamePhases',
        'initialPhaseState',
        { type: Sequelize.TEXT, allowNull: true, defaultValue: null },
        { transaction }
      );
      await queryInterface.addColumn(
        'GamePhases',
        'finalPhaseState',
        { type: Sequelize.TEXT, allowNull: true, defaultValue: null },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('GamePhases', 'initialPhaseState', {
        transaction,
      });
      await queryInterface.removeColumn('GamePhases', 'finalPhaseState', {
        transaction,
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
    }
  },
};
