'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert('Units', [
        {
          name: 'Archer',
          maxHealth: 2,
          movementSpeed: 150,
          pointsCost: 10,
          armorSaveRoll: 6,
          meleeNumAttacks: 1,
          meleeHitRoll: 4,
          meleeWoundRoll: 5,
          meleeArmorPiercing: 0,
          meleeDamage: 1,
          rangedRange: 300,
          rangedAmmo: 6,
          rangedNumAttacks: 2,
          rangedHitRoll: 3,
          rangedWoundRoll: 4,
          rangedArmorPiercing: 0,
          rangedDamage: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Peasant',
          maxHealth: 2,
          movementSpeed: 150,
          pointsCost: 5,
          armorSaveRoll: 6,
          meleeNumAttacks: 1,
          meleeHitRoll: 4,
          meleeWoundRoll: 5,
          meleeArmorPiercing: 0,
          meleeDamage: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Swordsman',
          maxHealth: 5,
          movementSpeed: 120,
          pointsCost: 20,
          armorSaveRoll: 4,
          meleeNumAttacks: 3,
          meleeHitRoll: 3,
          meleeWoundRoll: 3,
          meleeArmorPiercing: 1,
          meleeDamage: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Spearman',
          maxHealth: 5,
          movementSpeed: 120,
          pointsCost: 20,
          armorSaveRoll: 4,
          meleeNumAttacks: 2,
          meleeHitRoll: 3,
          meleeWoundRoll: 3,
          meleeArmorPiercing: 2,
          meleeDamage: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Light Cavalry',
          maxHealth: 5,
          movementSpeed: 350,
          pointsCost: 30,
          armorSaveRoll: 4,
          meleeNumAttacks: 3,
          meleeHitRoll: 3,
          meleeWoundRoll: 4,
          meleeArmorPiercing: 1,
          meleeDamage: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Heavy Cavalry',
          maxHealth: 8,
          movementSpeed: 280,
          pointsCost: 30,
          armorSaveRoll: 3,
          meleeNumAttacks: 3,
          meleeHitRoll: 3,
          meleeWoundRoll: 3,
          meleeArmorPiercing: 1,
          meleeDamage: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Ballista',
          maxHealth: 5,
          movementSpeed: 70,
          pointsCost: 30,
          armorSaveRoll: 5,
          meleeNumAttacks: 2,
          meleeHitRoll: 4,
          meleeWoundRoll: 5,
          meleeArmorPiercing: 0,
          meleeDamage: 1,
          rangedRange: 500,
          rangedAmmo: 4,
          rangedNumAttacks: 2,
          rangedHitRoll: 3,
          rangedWoundRoll: 2,
          rangedArmorPiercing: 2,
          rangedDamage: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Hero',
          maxHealth: 10,
          movementSpeed: 150,
          pointsCost: 60,
          armorSaveRoll: 3,
          meleeNumAttacks: 4,
          meleeHitRoll: 2,
          meleeWoundRoll: 3,
          meleeArmorPiercing: 1,
          meleeDamage: 2,
          rangedRange: 100,
          rangedAmmo: 2,
          rangedNumAttacks: 2,
          rangedHitRoll: 2,
          rangedWoundRoll: 3,
          rangedArmorPiercing: 1,
          rangedDamage: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('Units', null, {});
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
