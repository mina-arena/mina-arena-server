'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert('Units', [
        {
          name: 'Spearman',
          attackPower: 3,
          armor: 1,
          maxHealth: 4,
          movementSpeed: 40,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Swordsman',
          attackPower: 4,
          armor: 1,
          maxHealth: 4,
          movementSpeed: 45,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Archer',
          attackPower: 2,
          armor: 0,
          maxHealth: 2,
          movementSpeed: 40,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Light Cavalry',
          attackPower: 3,
          armor: 1,
          maxHealth: 6,
          movementSpeed: 100,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
