import * as Models from '../../models/index.js';
import sequelizeConnection from '../../db/config.js';
import { snakeToCamel, enforceOneOf } from '../helpers.js';
import resolveMoveAction from '../../service_objects/game_piece_action_resolvers/move_resolver';
import resolveRangedAttackAction from '../../service_objects/game_piece_action_resolvers/ranged_attack_resolver';
import resolveMeleeAttackAction from '../../service_objects/game_piece_action_resolvers/melee_attack_resolver';
export default async (parent, args, contextValue, info) => {
    return await sequelizeConnection.transaction(async (t) => {
        // Validate that Player exists
        const player = await Models.Player.findOne({
            where: { minaPublicKey: args.input.minaPublicKey },
            transaction: t
        });
        if (!player)
            throw new Error(`Player with minaPublicKey ${args.input.minaPublicKey} not found`);
        // Validate that Game exists and is in progress
        const game = await Models.Game.findByPk(args.input.gameId, { transaction: t });
        if (!game)
            throw new Error(`Game with ID ${args.input.gameId} not found`);
        if (game.status !== 'inProgress')
            throw new Error(`Game ${args.input.gameId} is not in progress`);
        // Validate that GamePlayer exists and it's their turn
        const gamePlayer = await Models.GamePlayer.findOne({
            where: { gameId: game.id, playerId: player.id },
            transaction: t
        });
        if (!gamePlayer)
            throw new Error(`Player ${player.name} is not present in Game ${game.id}`);
        if (game.turnGamePlayerId != gamePlayer.id)
            throw new Error(`It is not your turn!`);
        const gamePhase = await game.currentPhase();
        let createdGamePieceActions = [];
        for (const actionInput of args.input.actions) {
            enforceOneOf(actionInput, ['moveInput', 'rangedAttackInput', 'meleeAttackInput']);
            // Validate that this action is allowed in this phase
            let rawActionType = actionInput.actionType;
            let actionType = snakeToCamel(rawActionType);
            if (!gamePhase.actionTypeAllowed(actionType)) {
                throw new Error(`ActionType ${rawActionType} not allowed in phase ${gamePhase.phase}`);
            }
            // Validate GamePiece
            let gamePiece = await Models.GamePiece.findByPk(actionInput.gamePieceId, { transaction: t });
            if (!gamePiece)
                throw new Error(`GamePiece with ID ${actionInput.gamePieceId} not found`);
            if (gamePiece.gamePlayerId != gamePlayer.id)
                throw new Error(`GamePiece ${gamePiece.id} does not belong to you`);
            switch (actionType) {
                case 'move':
                    createdGamePieceActions.push(await handleMoveAction(gamePlayer, gamePhase, gamePiece, actionInput.moveInput, t));
                    break;
                case 'rangedAttack':
                    createdGamePieceActions.push(await handleRangedAttackAction(gamePlayer, gamePhase, gamePiece, actionInput.rangedAttackInput, t));
                    break;
                case 'meleeAttack':
                    createdGamePieceActions.push(await handleMeleeAttackAction(gamePlayer, gamePhase, gamePiece, actionInput.meleeAttackInput, t));
                    break;
            }
        }
        return createdGamePieceActions;
    });
};
async function handleMoveAction(gamePlayer, gamePhase, gamePiece, moveInput, transaction) {
    // Validate move data, raises exception if not valid
    await resolveMoveAction(gamePiece, moveInput.moveFrom, moveInput.moveTo, false, // commitChanges: false so we do a dry run
    transaction);
    return await Models.GamePieceAction.create({
        gamePhaseId: gamePhase.id,
        gamePlayerId: gamePlayer.id,
        gamePieceId: gamePiece.id,
        actionType: 'move',
        actionData: {
            actionType: 'move',
            moveFrom: gamePiece.coordinates(),
            moveTo: moveInput.moveTo
        }
    }, { transaction: transaction });
}
async function handleRangedAttackAction(gamePlayer, gamePhase, gamePiece, rangedAttackInput, transaction) {
    const targetGamePiece = await Models.GamePiece.findByPk(rangedAttackInput.targetGamePieceId, { transaction: transaction });
    // Validate attack data, raises exception if not valid
    await resolveRangedAttackAction(gamePiece, rangedAttackInput.targetGamePieceId, false, // commitChanges: false so we do a dry run
    transaction);
    return await Models.GamePieceAction.create({
        gamePhaseId: gamePhase.id,
        gamePlayerId: gamePlayer.id,
        gamePieceId: gamePiece.id,
        actionType: 'rangedAttack',
        actionData: {
            actionType: 'rangedAttack',
            targetGamePieceId: targetGamePiece.id,
        }
    }, { transaction: transaction });
}
async function handleMeleeAttackAction(gamePlayer, gamePhase, gamePiece, meleeAttackInput, transaction) {
    const targetGamePiece = await Models.GamePiece.findByPk(meleeAttackInput.targetGamePieceId, { transaction: transaction });
    // Validate attack data, raises exception if not valid
    await resolveMeleeAttackAction(gamePiece, meleeAttackInput.targetGamePieceId, false, // commitChanges: false so we do a dry run
    transaction);
    return await Models.GamePieceAction.create({
        gamePhaseId: gamePhase.id,
        gamePlayerId: gamePlayer.id,
        gamePieceId: gamePiece.id,
        actionType: 'meleeAttack',
        actionData: {
            actionType: 'meleeAttack',
            targetGamePieceId: targetGamePiece.id,
        }
    }, { transaction: transaction });
}
//# sourceMappingURL=create_game_piece_actions.js.map