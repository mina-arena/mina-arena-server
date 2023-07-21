'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'Games',
        'gameProof',
        { type: Sequelize.JSONB, allowNull: true, defaultValue: null },
        { transaction }
      );
      await queryInterface.addColumn(
        'GamePhases',
        'turnProof',
        { type: Sequelize.JSONB, allowNull: true, defaultValue: null },
        { transaction }
      );
      await queryInterface.addColumn(
        'GamePhases',
        'phaseProof',
        { type: Sequelize.JSONB, allowNull: true, defaultValue: null },
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
      await queryInterface.removeColumn('Games', 'gameProof', {
        transaction,
      });
      await queryInterface.removeColumn('GamePhases', 'turnProof', {
        transaction,
      });
      await queryInterface.removeColumn('GamePhases', 'phaseProof', {
        transaction,
      });
    } catch (err) {
      // await transaction.rollback();
      console.error(err);
    }
  },
};
