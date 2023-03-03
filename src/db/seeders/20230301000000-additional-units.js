'use strict';

/**
 * ABC: EKEjLjEuKU5VVANcsEPZQh1cTjxeEuWWNsMp2ZtQH3vp6n4rtLZb
 * DEF: EKEWeopDujzfcYTQcMkwc1MJk3Uxa5p4L1xvitueTpnPJBXUcrv6
 * GHI: EKFSqXPE5qUy2ARCCX3Vaon9rHNLEedYjUpH4b8RVmqmE7RiJ7Cn
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert('Players', [{
        name: 'ABC',
        minaPublicKey: 'B62qinnN8N4wXLR9K1Ji2HbeTG2k3nVBDD3AHyYP38wUDzPkq4YctHL',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'DEF',
        minaPublicKey: 'B62qpq9xPZGJvv2CwhRBsYGb9yHPaar6HWSJ8rC3s54mX7f8X9wX15s',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'GHI',
        minaPublicKey: 'B62qoNu9P7wAk3MLrfAhL3pLC7kMRbQcqiHSQB8q6KuzVtB2D24KEAA',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);

      await queryInterface.bulkInsert('Units', [{
        name: 'Swordman',
        attackPower: 4,
        armor: 2,
        maxHealth: 3,
        movementSpeed: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Horseman',
        attackPower: 2,
        armor: 3,
        maxHealth: 6,
        movementSpeed: 2,
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
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
