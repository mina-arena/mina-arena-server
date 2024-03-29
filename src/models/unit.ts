import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';
import { Unit as SnarkyUnit, UnitStats } from 'mina-arena-contracts';
import { UInt32 } from 'snarkyjs';

// TODO: Explore making different units have different base sizes (i.e. radius)
export const UNIT_RADIUS = 12;

class Unit extends Model<InferAttributes<Unit>, InferCreationAttributes<Unit>> {
  declare id: CreationOptional<number>;
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

  declare rangedRange: CreationOptional<number>;
  declare rangedNumAttacks: CreationOptional<number>;
  declare rangedHitRoll: CreationOptional<number>;
  declare rangedWoundRoll: CreationOptional<number>;
  declare rangedArmorPiercing: CreationOptional<number>;
  declare rangedDamage: CreationOptional<number>;
  declare rangedAmmo: CreationOptional<number>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  async playerUnits(): Promise<Models.PlayerUnit[]> {
    return await Models.PlayerUnit.findAll({ where: { unitId: this.id } });
  }

  toSnarkyUnit(): SnarkyUnit {
    return new SnarkyUnit({
      stats: new UnitStats({
        health: UInt32.from(this.maxHealth),
        movement: UInt32.from(this.movementSpeed),
        rangedAttackRange: UInt32.from(this.rangedRange || 0),
        rangedHitRoll: UInt32.from(this.rangedHitRoll || 0),
        rangedWoundRoll: UInt32.from(this.rangedWoundRoll || 0),
        saveRoll: UInt32.from(this.armorSaveRoll || 0),
        rangedDamage: UInt32.from(this.rangedDamage || 0),
        meleeHitRoll: UInt32.from(this.meleeHitRoll || 0),
        meleeWoundRoll: UInt32.from(this.meleeWoundRoll || 0),
        meleeDamage: UInt32.from(this.meleeDamage || 0),
      }),
    });
  }

  canMakeRangedAttack(): boolean {
    if (this.rangedNumAttacks) {
      return this.rangedNumAttacks > 0;
    } else {
      return false;
    }
  }
}

Unit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pointsCost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    armorSaveRoll: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    meleeNumAttacks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    meleeHitRoll: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    meleeWoundRoll: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    meleeArmorPiercing: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    meleeDamage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rangedRange: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rangedNumAttacks: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rangedHitRoll: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rangedWoundRoll: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rangedArmorPiercing: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rangedDamage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rangedAmmo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maxHealth: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    movementSpeed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: sequelizeConnection,
  }
);

export default Unit;
