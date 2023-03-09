'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Units', [{
      name: 'Spearman',
      attackPower: 3,
      armor: 1,
      maxHealth: 4,
      movementSpeed: 12,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('Units', [{
      name: 'Swordsman',
      attackPower: 4,
      armor: 1,
      maxHealth: 4,
      movementSpeed: 15,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('Units', [{
      name: 'Archer',
      attackPower: 2,
      armor: 1,
      maxHealth: 2,
      movementSpeed: 18,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('Units', [{
      name: 'Light Cavalry',
      attackPower: 3,
      armor: 1,
      maxHealth: 5,
      movementSpeed: 30,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('Units', [{
      name: 'Heavy Cavalry',
      attackPower: 5,
      armor: 3,
      maxHealth: 7,
      movementSpeed: 24,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    // n/a
  }
};
