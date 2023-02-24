import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';

class GameArena extends Model<InferAttributes<GameArena>, InferCreationAttributes<GameArena>> {
  declare id: number;
  declare gameId: number;
  declare width: number;
  declare height: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

GameArena.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  gameId: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  width: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  height: {
    allowNull: false,
    type: DataTypes.INTEGER,
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

export default GameArena;