import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';

class GamePlayer extends Model<InferAttributes<GamePlayer>, InferCreationAttributes<GamePlayer>> {
  declare id: number;
  declare gameId: number;
  declare playerId: number;
  declare playerNumber: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

GamePlayer.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  gameId: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  playerId: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  playerNumber: {
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

export default GamePlayer;