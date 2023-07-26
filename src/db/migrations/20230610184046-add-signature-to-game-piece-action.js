'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'GamePieceActions',
        'signature',
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
      await queryInterface.removeColumn('GamePieceActions', 'signature', {
        transaction,
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
    }
  },
};
