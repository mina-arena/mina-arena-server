import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';

class PlayerUnit extends Model<InferAttributes<PlayerUnit>, InferCreationAttributes<PlayerUnit>> {
  declare id: number;
  declare name: string;
  declare playerId: number;
  declare unitId: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

PlayerUnit.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  playerId: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  unitId: {
    allowNull: false,
    type: DataTypes.INTEGER
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

export default PlayerUnit;