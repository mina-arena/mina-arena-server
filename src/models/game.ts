import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import { GamePhaseName } from './game_phase.js';
import * as Models from './index.js';

type GameStatus = 'pending' | 'inProgress' | 'completed' | 'canceled';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 2;
export const MAX_POINTS = 100;
export const MAX_PIECES = 6;

class Game extends Model<InferAttributes<Game>, InferCreationAttributes<Game>> {
  declare id: CreationOptional<number>;
  declare status: GameStatus;
  declare turnNumber: CreationOptional<number>;
  declare phase: CreationOptional<GamePhaseName>;
  declare turnPlayerOrder: CreationOptional<string>;
  declare turnGamePlayerId: CreationOptional<number>;
  declare winningGamePlayerId: CreationOptional<number>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

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

  // Get the GamePlayer whose turn it is
  async turnGamePlayer(): Promise<Models.GamePlayer> {
    if (this.turnGamePlayerId === undefined) return null;

    return await Models.GamePlayer.findByPk(this.turnGamePlayerId);
  }

  // Get the GamePlayer who will be taking the next turn
  async nextGamePlayer(): Promise<Models.GamePlayer> {
    const nextNumber = await this.nextGamePlayerNumber();
    return await Models.GamePlayer.findOne({
      where: {
        gameId: this.id,
        playerNumber: nextNumber
      }
    });
  }

  async winningGamePlayer(): Promise<Models.GamePlayer> {
    if (this.winningGamePlayerId === undefined) return null;

    return await Models.GamePlayer.findByPk(this.winningGamePlayerId);
  }

  async gameArena(): Promise<Models.GameArena> {
    return await Models.GameArena.findOne({ where: { gameId: this.id }});
  }

  // Get an array of integers representing the order in which players take turns.
  // Each integer element is the playerNumber of the associated GamePlayer.
  turnPlayerOrderArray(): number[] {
    return this.turnPlayerOrder.split(',').map(numStr => +numStr);
  }

  // Get the playerNumber of the GamePlayer whose turn it is
  async turnGamePlayerNumber(): Promise<number> {
    return (await this.turnGamePlayer()).playerNumber;
  }

  // Get the playerNumber of the GamePlayer who will be taking the next turn
  async nextGamePlayerNumber(): Promise<number> {
    const currentPlayerNumber = await this.turnGamePlayerNumber();
    const playerNumberOrder = this.turnPlayerOrderArray();

    const currentPlayerIndex = playerNumberOrder.indexOf(currentPlayerNumber);
    if (currentPlayerIndex == (playerNumberOrder.length - 1)) {
      return playerNumberOrder[0];
    } else {
      return playerNumberOrder[currentPlayerIndex + 1];
    }
  }
}

Game.init({
  id: {
    type: DataTypes.INTEGER,
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
  sequelize: sequelizeConnection
});

export default Game;