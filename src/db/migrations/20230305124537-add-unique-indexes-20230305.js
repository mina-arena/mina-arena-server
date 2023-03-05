'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addIndex(
        'Players',
        {
          fields: ['minaPublicKey'],
          unique: true,
          name: 'unique_player_mina_public_key'
        },
        { transaction }
      );
      await queryInterface.addIndex(
        'PlayerUnits',
        {
          fields: ['playerId', 'name'],
          unique: true,
          name: 'unique_player_unit_name_by_player'
        },
        { transaction }
      );
      await queryInterface.addIndex(
        'Units',
        {
          fields: ['name'],
          unique: true,
          name: 'unique_unit_name'
        },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeIndex(
        'Players',
        'unique_player_mina_public_key',
        { transaction }
      );
      await queryInterface.removeIndex(
        'PlayerUnits',
        'unique_player_unit_name_by_player',
        { transaction }
      );
      await queryInterface.removeIndex(
        'Units',
        'unique_unit_name',
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
