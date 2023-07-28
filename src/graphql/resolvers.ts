import {
  DiceRollInput,
  GameStatus,
  Resolvers,
} from './__generated__/resolvers-types';
import * as Models from '../models/index.js';
import * as Mutations from './mutations/index.js';

import { camelToScreamingSnake, snakeToCamel } from './helpers.js';
import {
  GamePieceRangedAttackAction,
  GamePieceMeleeAttackAction,
} from '../models/game_piece_action';

const resolvers: Resolvers = {
  Query: {
    games: async (parent, args, contextValue, info): Promise<Models.Game[]> => {
      return await Models.Game.findAll();
    },
    gamesForPlayer: async (
      parent,
      args: { minaPublicKey: string; statuses?: GameStatus[] },
      contextValue,
      info
    ): Promise<Models.Game[]> => {
      const player = await Models.Player.findOne({
        where: { minaPublicKey: args.minaPublicKey },
      });
      const gamePlayers = await Models.GamePlayer.findAll({
        where: { playerId: player.id },
      });
      let queryFilter = { id: gamePlayers.map((gp) => gp.gameId) };
      if (args.statuses && args.statuses.length > 0) {
        queryFilter['status'] = args.statuses.map((s) => snakeToCamel(s));
      }
      return await Models.Game.findAll({ where: queryFilter });
    },
    game: async (
      parent,
      args: { id: number },
      contextValue,
      info
    ): Promise<Models.Game> => {
      return await Models.Game.findByPk(args.id);
    },
    units: async (parent, args, contextValue, info): Promise<Models.Unit[]> => {
      return await Models.Unit.findAll();
    },
    player: async (
      parent,
      args: { minaPublicKey: string },
      contextValue,
      info
    ): Promise<Models.Player> => {
      return await Models.Player.findOne({
        where: { minaPublicKey: args.minaPublicKey },
      });
    },
  },
  Mutation: {
    createGame: Mutations.createGame,
    createGamePieces: Mutations.createGamePieces,
    startGame: Mutations.startGame,
    createGamePieceActions: Mutations.createGamePieceActions,
    submitGamePhase: Mutations.submitGamePhase,
  },
  // Define custom field resolvers for fields
  // which require some kind of transformation
  Game: {
    status: (game) => camelToScreamingSnake(game.status),
    turnPlayerOrder: (game) => game.gamePlayersInTurnOrder(),
    arena: (game) => game.gameArena(),
  },
  GamePhase: {
    name: (gamePhase) => camelToScreamingSnake(gamePhase.phase),
  },
  GamePiece: {
    coordinates: function (gamePiece) {
      if (!gamePiece.positionX && !gamePiece.positionY) return null;

      return { x: gamePiece.positionX, y: gamePiece.positionY };
    },
    gamePieceNumber: async function (gamePiece) {
      return await gamePiece.gamePieceNumber();
    },
    hash: async function (gamePiece) {
      const snarkyPiece = await gamePiece.toSnarkyPiece();
      const hash = snarkyPiece.hash();
      return hash.toString();
    },
  },
  GamePieceAction: {
    actionType: (action) => camelToScreamingSnake(action.actionType),
  },
  GamePieceActionData: {
    __resolveType(obj, contextValue, info) {
      switch (obj.actionType) {
        case 'move':
          return 'GamePieceMoveAction';
          break;
        case 'rangedAttack':
          return 'GamePieceRangedAttackAction';
          break;
        case 'meleeAttack':
          return 'GamePieceMeleeAttackAction';
          break;
      }
    },
  },
  GamePieceRangedAttackAction: {
    targetGamePiece: async (action) => {
      return await Models.GamePiece.findByPk(action.targetGamePieceId);
    },
    rollInput: (action: GamePieceRangedAttackAction) => {
      const diceRolls = {
        publicKey: action.encryptedAttackRolls.publicKey,
        cipherText: action.encryptedAttackRolls.ciphertext.join(''),
        signature: action.encryptedAttackRolls.signature,
      };
      return JSON.stringify(diceRolls);
    },
  },
  GamePieceMeleeAttackAction: {
    targetGamePiece: async (action) => {
      return await Models.GamePiece.findByPk(action.targetGamePieceId);
    },
    rollInput: (action: GamePieceMeleeAttackAction) => {
      const diceRolls = {
        publicKey: action.encryptedAttackRolls.publicKey,
        cipherText: action.encryptedAttackRolls.ciphertext.join(''),
        signature: action.encryptedAttackRolls.signature,
      };
      return JSON.stringify(diceRolls);
    },
  },
};

export default resolvers;
