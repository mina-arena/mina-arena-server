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
      await queryInterface.addIndex(
        'GamePlayers',
        {
          fields: ['gameId', 'playerId'],
          unique: true,
          name: 'unique_game_player_game_id_player_id'
        },
        { transaction }
      );
      await queryInterface.addIndex(
        'GamePlayers',
        {
          fields: ['gameId', 'playerNumber'],
          unique: true,
          name: 'unique_game_player_game_id_player_number'
        },
        { transaction }
      );
      await queryInterface.addIndex(
        'GamePieces',
        {
          fields: ['gameId', 'playerUnitId'],
          unique: true,
          name: 'unique_game_piece_game_id_player_unit_id'
        },
        { transaction }
      );
      await queryInterface.addIndex(
        'GamePhases',
        {
          fields: ['gameId', 'turnNumber', 'phase'],
          unique: true,
          name: 'unique_game_phase_game_turn_phase'
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
      await queryInterface.removeIndex('Players', 'unique_player_mina_public_key', { transaction });
      await queryInterface.removeIndex('PlayerUnits', 'unique_player_unit_name_by_player', { transaction });
      await queryInterface.removeIndex('Units', 'unique_unit_name', { transaction });
      await queryInterface.removeIndex('GamePlayers', 'unique_game_player_game_id_player_id', { transaction });
      await queryInterface.removeIndex('GamePlayers', 'unique_game_player_game_id_player_number', { transaction });
      await queryInterface.removeIndex('GamePieces', 'unique_game_piece_game_id_player_unit_id', { transaction });
      await queryInterface.removeIndex('GamePhases', 'unique_game_phase_game_turn_phase', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
