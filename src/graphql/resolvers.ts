import { Resolvers } from './__generated__/resolvers-types';
import * as Types from './__generated__/resolvers-types';
import * as Models from '../models/index.js';
import * as Mutations from './mutations/index.js';

import { camelToScreamingSnake } from './helpers.js';

const resolvers: Resolvers = {
  Query: {
    games: async (
      parent,
      args,
      contextValue,
      info
    ): Promise<Models.Game[]> => {
      return await Models.Game.findAll();
    },
    game: async (
      parent,
      args: { id: string },
      contextValue,
      info
    ): Promise<Models.Game> => {
      return await Models.Game.findByPk(args.id);
    },
  },
  Mutation: {
    createGame: async (
      parent,
      args: { input: Types.CreateGameInput },
      contextValue,
      info
    ): Promise<Models.Game> => {
      return await Models.Game.create(args.input)
    },
    createGamePieces: Mutations.createGamePieces,
  },
  // Define custom field resolvers for fields
  // which require some kind of transformation
  Game: {
    id: game => game.id.toString(),
    status: game => camelToScreamingSnake(game.status),
    turnPlayerOrder: game => game.gamePlayersInTurnOrder(),
  },
  GamePhase: {
    id: gamePhase => gamePhase.id.toString(),
    name: gamePhase => camelToScreamingSnake(gamePhase.phase),
  },
  GamePiece: {
    coordinates: function(gamePiece) {
      if (!gamePiece.positionX && !gamePiece.positionY) return null;

      return { x: gamePiece.positionX, y: gamePiece.positionY };
    },
  },
  GamePieceAction: {
    actionType: action => camelToScreamingSnake(action.actionType),
  },
  GamePieceActionData: {
    __resolveType(obj, contextValue, info){
      switch(obj.actionType) {
        case 'move':
          return 'GamePieceMoveAction'
          break;
        case 'rangedAttack':
          return 'GamePieceRangedAttackAction'
          break;
        case 'meleeAttack':
          return 'GamePieceMeleeAttackAction'
          break;
      }
    },
  }
};

export default resolvers;
