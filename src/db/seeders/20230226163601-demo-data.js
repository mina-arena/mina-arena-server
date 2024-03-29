'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert('Players', [{
        name: 'Player 1',
        minaPublicKey: 'B62qpYmDbDJAyADVkJzydoz7QeZy1ZTiWeH1LSuyMxXezvu5mAQi53U',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Player 2',
        minaPublicKey: 'B62qpge4uMq4Vv5Rvc8Gw9qSquUYd6xoW1pz7HQkMSHm6h1o7pvLPAN',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);

      await queryInterface.bulkInsert('Games', [{
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('Players', null, {});
      await queryInterface.bulkDelete('Units', null, {});
      await queryInterface.bulkDelete('Games', null, {});
      await queryInterface.bulkDelete('GamePlayers', null, {});
      await queryInterface.bulkDelete('GamePieces', null, {});
      await queryInterface.bulkDelete('GamePhases', null, {});
      await queryInterface.bulkDelete('PlayerUnits', null, {});
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
