'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const units = [
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
        },
        {
          name: 'Swordsman',
          maxHealth: 3,
          movementSpeed: 120,
          pointsCost: 20,
          armorSaveRoll: 4,
          meleeNumAttacks: 3,
          meleeHitRoll: 3,
          meleeWoundRoll: 3,
          meleeArmorPiercing: 1,
          meleeDamage: 1,
        },
        {
          name: 'Spearman',
          maxHealth: 3,
          movementSpeed: 120,
          pointsCost: 20,
          armorSaveRoll: 4,
          meleeNumAttacks: 2,
          meleeHitRoll: 3,
          meleeWoundRoll: 3,
          meleeArmorPiercing: 2,
          meleeDamage: 1,
        },
        {
          name: 'Light Cavalry',
          maxHealth: 3,
          movementSpeed: 350,
          pointsCost: 30,
          armorSaveRoll: 5,
          meleeNumAttacks: 3,
          meleeHitRoll: 3,
          meleeWoundRoll: 4,
          meleeArmorPiercing: 1,
          meleeDamage: 1,
        },
        {
          name: 'Heavy Cavalry',
          maxHealth: 5,
          movementSpeed: 280,
          pointsCost: 30,
          armorSaveRoll: 3,
          meleeNumAttacks: 3,
          meleeHitRoll: 3,
          meleeWoundRoll: 3,
          meleeArmorPiercing: 1,
          meleeDamage: 2,
        },
        {
          name: 'Ballista',
          maxHealth: 3,
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
        },
        {
          name: 'Hero',
          maxHealth: 5,
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
        },
      ];

      for (const unitAttrs of units) {
        console.log(`Upserting unit ${unitAttrs.name}`);
        const numRecordsUpdated = await queryInterface.bulkUpdate(
          'Units',
          unitAttrs,
          { name: unitAttrs.name },
          { transaction }
        );
        if (numRecordsUpdated === 0) {
          console.log(`No Unit with name ${unitAttrs.name} found, creating`);
          await queryInterface.bulkInsert(
            'Units',
            [
              {
                ...unitAttrs,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            { transaction }
          );
        }
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('Units', null, {});
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
