import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';

export type GamePhaseName = 'movement' | 'shooting' | 'melee';

class GamePhase extends Model<InferAttributes<GamePhase>, InferCreationAttributes<GamePhase>> {
  declare id: number;
  declare gameId: number;
  declare gamePlayerId: number;
  declare turnNumber: number;
  declare phase: GamePhaseName;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  async game(): Promise<Models.Game> {
    return await Models.Game.findByPk(this.gameId);
  }

  async gamePlayer(): Promise<Models.GamePlayer> {
    return await Models.GamePlayer.findByPk(this.gamePlayerId);
  }

  async gamePieceActions(): Promise<Models.GamePieceAction[]> {
    return await Models.GamePieceAction.findAll({
      where: { gamePhaseId: this.id },
      order: [['id', 'ASC']]
    });
  }
}

GamePhase.init({
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
  turnNumber: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  phase: {
    allowNull: false,
    type: DataTypes.ENUM('movement', 'shooting', 'melee')
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
    afterDestroy: async (gamePhase, options) => {
      await Models.GamePieceAction.destroy({ where: { gamePhaseId: gamePhase.id }});
    }
  },
  sequelize: sequelizeConnection
});

export default GamePhase;