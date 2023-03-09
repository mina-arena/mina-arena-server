import * as Models from '../models/index.js';
import * as Mutations from './mutations/index.js';
import { camelToScreamingSnake } from './helpers.js';
const resolvers = {
    Query: {
        games: async (parent, args, contextValue, info) => {
            return await Models.Game.findAll();
        },
        game: async (parent, args, contextValue, info) => {
            return await Models.Game.findByPk(args.id);
        },
        units: async (parent, args, contextValue, info) => {
            return await Models.Unit.findAll();
        },
        player: async (parent, args, contextValue, info) => {
            return await Models.Player.findOne({ where: { minaPublicKey: args.minaPublicKey } });
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
        id: game => game.id.toString(),
        status: game => camelToScreamingSnake(game.status),
        turnPlayerOrder: game => game.gamePlayersInTurnOrder(),
        arena: game => game.gameArena(),
    },
    GamePhase: {
        id: gamePhase => gamePhase.id.toString(),
        name: gamePhase => camelToScreamingSnake(gamePhase.phase),
    },
    GamePiece: {
        coordinates: function (gamePiece) {
            if (!gamePiece.positionX && !gamePiece.positionY)
                return null;
            return { x: gamePiece.positionX, y: gamePiece.positionY };
        },
    },
    GamePieceAction: {
        actionType: action => camelToScreamingSnake(action.actionType),
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
    },
    GamePieceMeleeAttackAction: {
        targetGamePiece: async (action) => {
            return await Models.GamePiece.findByPk(action.targetGamePieceId);
        },
    },
};
export default resolvers;
//# sourceMappingURL=resolvers.js.map