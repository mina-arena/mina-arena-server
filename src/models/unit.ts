import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';

export const MELEE_ATTACK_RANGE = 5;
export const RANGED_ATTACK_RANGE = 35;

class Unit extends Model<InferAttributes<Unit>, InferCreationAttributes<Unit>> {
  declare id: number;
  declare name: string;
  declare maxHealth: number;
  declare movementSpeed: number;
  declare armorSaveRoll: number;
  declare pointsCost: number;

  declare meleeNumAttacks: number;
  declare meleeHitRoll: number;
  declare meleeWoundRoll: number;
  declare meleeArmorPiercing: number;
  declare meleeDamage: number;

  declare rangedRange: number;
  declare rangedNumAttacks: number;
  declare rangedHitRoll: number;
  declare rangedWoundRoll: number;
  declare rangedArmorPiercing: number;
  declare rangedDamage: number;
  declare rangedAmmo: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  async playerUnits(): Promise<Models.PlayerUnit[]> {
    return await Models.PlayerUnit.findAll({ where: { unitId: this.id } });
  }
}

Unit.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pointsCost: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  armorSaveRoll: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  meleeNumAttacks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  meleeHitRoll: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  meleeWoundRoll: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  meleeArmorPiercing: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  meleeDamage: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rangedRange: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rangedNumAttacks: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rangedHitRoll: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rangedWoundRoll: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rangedArmorPiercing: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rangedDamage: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rangedAmmo: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  maxHealth: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  movementSpeed: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE,
  },
}, {
  sequelize: sequelizeConnection
});

export default Unit;