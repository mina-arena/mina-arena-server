'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'Units',
        'pointsCost',
        { type: Sequelize.INTEGER, allowNull: false, defaultValue: 10 },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'armorSaveRoll',
        { type: Sequelize.INTEGER, allowNull: false, defaultValue: 6 },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'meleeNumAttacks',
        { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'meleeHitRoll',
        { type: Sequelize.INTEGER, allowNull: false, defaultValue: 4 },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'meleeWoundRoll',
        { type: Sequelize.INTEGER, allowNull: false, defaultValue: 4 },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'meleeArmorPiercing',
        { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'meleeDamage',
        { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'rangedRange',
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'rangedNumAttacks',
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'rangedHitRoll',
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'rangedWoundRoll',
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'rangedArmorPiercing',
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'rangedDamage',
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'rangedAmmo',
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'armor',
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'attackPower',
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
      await queryInterface.addColumn(
        'Units',
        'armor',
        { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        { transaction }
      );
      await queryInterface.addColumn(
        'Units',
        'attackPower',
        { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'armorSaveRoll',
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'meleeNumAttacks',
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'meleeHitRoll',
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'meleeWoundRoll',
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'meleeArmorPiercing',
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'meleeDamage',
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'rangedRange',
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'rangedNumAttacks',
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'rangedHitRoll',
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'rangedWoundRoll',
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'rangedArmorPiercing',
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'rangedDamage',
        { transaction }
      );
      await queryInterface.removeColumn(
        'Units',
        'rangedAmmo',
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
