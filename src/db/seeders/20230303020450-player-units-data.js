'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const player = await queryInterface.sequelize.query(
        `SELECT id FROM public."Players" WHERE name = 'ABC';`
      );

      const spear = await queryInterface.sequelize.query(
        `SELECT id FROM public."Units" WHERE name = 'Spearman';`
      );

      const sword = await queryInterface.sequelize.query(
        `SELECT id FROM public."Units" WHERE name = 'Swordman';`
      );

      await queryInterface.bulkInsert('PlayerUnits', [{
        name: 'I see your point!',
        playerId: player[0][0].id,
        unitId: spear[0][0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lancelot',
        playerId: player[0][0].id,
        unitId: sword[0][0].id,
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
      await queryInterface.bulkDelete('PlayerUnits', null, {});
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
