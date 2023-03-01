import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import { GamePhaseName } from './game_phase.js';
import * as Models from './index.js';

type GameStatus = 'pending' | 'inProgress' | 'completed' | 'canceled';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 2;
export const MAX_POINTS = 25;
export const MAX_PIECES = 6;

class Game extends Model<InferAttributes<Game>, InferCreationAttributes<Game>> {
  declare id: number;
  declare status: GameStatus;
  declare turnNumber: CreationOptional<number>;
  declare phase: CreationOptional<GamePhaseName>;
  declare turnPlayerOrder: CreationOptional<string>;
  declare turnGamePlayerId: CreationOptional<number>;
  declare winningGamePlayerId: CreationOptional<number>;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  async gamePlayers(): Promise<Models.GamePlayer[]> {
    return await Models.GamePlayer.findAll({ where: { gameId: this.id } });
  }

  async gamePlayersInTurnOrder(): Promise<Models.GamePlayer[]> {
    if (this.turnPlayerOrder === undefined) return [];

    var playerNums = this.turnPlayerOrderArray();
    var gamePlayers = await Models.GamePlayer.findAll({
      where: { gameId: this.id, playerNumber: playerNums }
    });
    // TODO: This is super inefficient, but fine for
    // now since we'll only have two players per game.
    return playerNums.map(function(playerNum) {
      return gamePlayers.find(function(gamePlayer) {
        return gamePlayer.playerNumber == +playerNum;
      });
    });
  }

  async gamePhases(): Promise<Models.GamePhase[]> {
    return await Models.GamePhase.findAll({ where: { gameId: this.id } });
  }

  async gamePieces(): Promise<Models.GamePiece[]> {
    return await Models.GamePiece.findAll({ where: { gameId: this.id } });
  }

  async currentPhase(): Promise<Models.GamePhase> {
    return await Models.GamePhase.findOne({
      where: { gameId: this.id },
      order: [['id', 'DESC']]
    })
  }

  async turnGamePlayer(): Promise<Models.GamePlayer> {
    if (this.turnGamePlayerId === undefined) return null;

    return await Models.GamePlayer.findByPk(this.turnGamePlayerId);
  }

  async winningGamePlayer(): Promise<Models.GamePlayer> {
    if (this.winningGamePlayerId === undefined) return null;

    return await Models.GamePlayer.findByPk(this.winningGamePlayerId);
  }

  async gameArena(): Promise<Models.GameArena> {
    return await Models.GameArena.findOne({ where: { gameId: this.id }});
  }

  turnPlayerOrderArray(): number[] {
    return this.turnPlayerOrder.split(',').map(numStr => +numStr);
  }
}

Game.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    allowNull: false,
    type: DataTypes.ENUM('pending', 'inProgress', 'completed', 'canceled')
  },
  turnNumber: {
    type: DataTypes.INTEGER
  },
  phase: {
    type: DataTypes.ENUM('movement', 'shooting', 'melee')
  },
  turnPlayerOrder: {
    type: DataTypes.STRING
  },
  turnGamePlayerId: {
    type: DataTypes.INTEGER
  },
  winningGamePlayerId: {
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
    afterDestroy: async (game, options) => {
      await Models.GameArena.destroy({ where: { gameId: game.id }});
      await Models.GamePhase.destroy({ where: { gameId: game.id }});
      await Models.GamePiece.destroy({ where: { gameId: game.id }});
      await Models.GamePlayer.destroy({ where: { gameId: game.id }});
    }
  },
  sequelize: sequelizeConnection
});

export default Game;