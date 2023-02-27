import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';

class GamePiece extends Model<InferAttributes<GamePiece>, InferCreationAttributes<GamePiece>> {
  declare id: CreationOptional<number>;
  declare gameId: number;
  declare gamePlayerId: number;
  declare playerUnitId: number;
  declare positionX: CreationOptional<number>;
  declare positionY: CreationOptional<number>;
  declare health: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  async game(): Promise<Models.Game> {
    return await Models.Game.findByPk(this.gameId);
  }

  async gamePlayer(): Promise<Models.GamePlayer> {
    return await Models.GamePlayer.findByPk(this.gamePlayerId);
  }

  async playerUnit(): Promise<Models.PlayerUnit> {
    return await Models.PlayerUnit.findByPk(this.playerUnitId);
  }
}

GamePiece.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  gameId: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  gamePlayerId: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  playerUnitId: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  positionX: {
    type: DataTypes.INTEGER
  },
  positionY: {
    type: DataTypes.INTEGER
  },
  health: {
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
  hooks: {
    afterDestroy: async (gamePiece, options) => {
      await Models.GamePieceAction.destroy({ where: { gamePieceId: gamePiece.id }});
    }
  },
  sequelize: sequelizeConnection
});

export default GamePiece;