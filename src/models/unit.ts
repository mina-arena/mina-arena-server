import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';

class Unit extends Model<InferAttributes<Unit>, InferCreationAttributes<Unit>> {
  declare id: number;
  declare name: string;
  declare attackPower: number;
  declare armor: number;
  declare maxHealth: number;
  declare movementSpeed: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
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
  attackPower: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  armor: {
    type: DataTypes.INTEGER,
    allowNull: false
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