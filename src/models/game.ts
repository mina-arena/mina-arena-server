import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelizeConnection from '../db/config.js';
import { GamePhaseName } from './game_phase.js';
import * as Models from './index.js';
import { GameState } from 'mina-arena-contracts';
import serializePiecesTree from '../service_objects/mina/pieces_tree_serializer.js';
import serializeArenaTree from '../service_objects/mina/arena_tree_serializer.js';
import { Field, PublicKey, UInt32 } from 'snarkyjs';
// import { ARENA_HEIGHT_U32, ARENA_WIDTH_U32 } from 'mina-arena-contracts';

type GameStatus = 'pending' | 'inProgress' | 'completed' | 'canceled';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 2;
export const MAX_POINTS = 100;
export const MAX_PIECES = 10;

class Game extends Model<InferAttributes<Game>, InferCreationAttributes<Game>> {
  declare id: CreationOptional<number>;
  declare status: GameStatus;
  declare turnNumber: CreationOptional<number>;
  declare phase: CreationOptional<GamePhaseName>;
  declare turnPlayerOrder: CreationOptional<string>;
  declare turnGamePlayerId: CreationOptional<number>;
  declare winningGamePlayerId: CreationOptional<number>;
  declare gameProof: CreationOptional<JSON>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  async gamePlayers(): Promise<Models.GamePlayer[]> {
    return await Models.GamePlayer.findAll({ where: { gameId: this.id } });
  }

  async gamePlayersInTurnOrder(): Promise<Models.GamePlayer[]> {
    if (this.turnPlayerOrder === undefined) return [];

    let playerNums = this.turnPlayerOrderArray();
    let gamePlayers = await Models.GamePlayer.findAll({
      where: { gameId: this.id, playerNumber: playerNums },
    });
    // TODO: This is super inefficient, but fine for
    // now since we'll only have two players per game.
    return playerNums.map(function (playerNum) {
      return gamePlayers.find(function (gamePlayer) {
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
      order: [['id', 'DESC']],
    });
  }

  async previousPhase(): Promise<Models.GamePhase> {
    const phases = await Models.GamePhase.findAll({
      where: { gameId: this.id },
      order: [['id', 'DESC']],
    });
    return phases[1];
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
        playerNumber: nextNumber,
      },
    });
  }

  async winningGamePlayer(): Promise<Models.GamePlayer> {
    if (this.winningGamePlayerId === undefined) return null;

    return await Models.GamePlayer.findByPk(this.winningGamePlayerId);
  }

  async gameArena(): Promise<Models.GameArena> {
    return await Models.GameArena.findOne({ where: { gameId: this.id } });
  }

  // Get an array of integers representing the order in which players take turns.
  // Each integer element is the playerNumber of the associated GamePlayer.
  turnPlayerOrderArray(): number[] {
    return this.turnPlayerOrder.split(',').map((numStr) => +numStr);
  }

  // Get the playerNumber of the GamePlayer whose turn it is
  async turnGamePlayerNumber(): Promise<0 | 1> {
    const _playerNumber = (await this.turnGamePlayer()).playerNumber;
    if (_playerNumber === 1) {
      return 1;
    } else {
      return 0;
    }
  }

  // Get the playerNumber of the GamePlayer who will be taking the next turn
  async nextGamePlayerNumber(): Promise<number> {
    const currentPlayerNumber = await this.turnGamePlayerNumber();
    const playerNumberOrder = this.turnPlayerOrderArray();

    const currentPlayerIndex = playerNumberOrder.indexOf(currentPlayerNumber);
    if (currentPlayerIndex == playerNumberOrder.length - 1) {
      return playerNumberOrder[0];
    } else {
      return playerNumberOrder[currentPlayerIndex + 1];
    }
  }

  async toSnarkyGameState(): Promise<GameState> {
    const pieces = await serializePiecesTree(this.id);
    const arena = await serializeArenaTree(this.id);
    const p1_id = this.turnPlayerOrder[0];
    const p2_id = this.turnPlayerOrder[1];
    if (!p1_id || !p2_id) {
      throw new Error('Both players must be in the game');
    }
    const p1 = await (await Models.GamePlayer.findByPk(p1_id)).player();
    const p2 = await (await Models.GamePlayer.findByPk(p2_id)).player();
    const turnsNonce = this.turnNumber || 0;
    const currentPlayerTurn = await this.turnGamePlayerNumber();
    return new GameState(
      pieces.tree.getRoot(),
      arena.tree.getRoot(),
      Field(currentPlayerTurn),
      PublicKey.fromBase58(p1.minaPublicKey),
      PublicKey.fromBase58(p2.minaPublicKey),
      UInt32.from(550),
      UInt32.from(650),
      Field(turnsNonce)
    );
  }
}

Game.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    status: {
      allowNull: false,
      type: DataTypes.ENUM('pending', 'inProgress', 'completed', 'canceled'),
    },
    turnNumber: {
      type: DataTypes.INTEGER,
    },
    phase: {
      type: DataTypes.ENUM('movement', 'shooting', 'melee'),
    },
    turnPlayerOrder: {
      type: DataTypes.STRING,
    },
    turnGamePlayerId: {
      type: DataTypes.INTEGER,
    },
    winningGamePlayerId: {
      type: DataTypes.INTEGER,
    },
    gameProof: {
      type: DataTypes.JSONB,
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

export default Game;
