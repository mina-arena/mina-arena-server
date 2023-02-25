import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';

class GamePlayer extends Model<InferAttributes<GamePlayer>, InferCreationAttributes<GamePlayer>> {
  declare id: number;
  declare gameId: number;
  declare playerId: number;
  declare playerNumber: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  async game(): Promise<Models.Game> {
    return await Models.Game.findByPk(this.gameId);
  }

  async player(): Promise<Models.Player> {
    return await Models.Player.findByPk(this.playerId);
  }
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