import * as Types from '../__generated__/resolvers-types';
import * as Models from '../../models/index.js';
import sequelizeConnection from '../../db/config.js';
import { unique, snakeToCamel, enforceOneOf } from '../helpers.js';
import { MELEE_ATTACK_RANGE, RANGED_ATTACK_RANGE } from '../../models/unit.js';

export default async (
  parent,
  args: { input: Types.CreateGamePieceActionsInput },
  contextValue,
  info
): Promise<Models.GamePieceAction[]> => {
  return await sequelizeConnection.transaction(async (t) => {
    // Validate that Player exists
    const player = await Models.Player.findOne({
      where: { minaPublicKey: args.input.minaPublicKey },
      transaction: t
    });
    if (!player) throw new Error(`Player with minaPublicKey ${args.input.minaPublicKey} not found`);

    // Validate that Game exists and is in progress
    const game = await Models.Game.findByPk(args.input.gameId, { transaction: t });
    if (!game) throw new Error(`Game with ID ${args.input.gameId} not found`);
    if (game.status !== 'inProgress') throw new Error(`Game ${args.input.gameId} is not in progress`);

    // Validate that GamePlayer exists and it's their turn
    const gamePlayer = await Models.GamePlayer.findOne({
      where: { gameId: game.id, playerId: player.id },
      transaction: t
    });
    if (!gamePlayer) throw new Error(`Player ${player.name} is not present in Game ${game.id}`);
    if (game.turnGamePlayerId != gamePlayer.id) throw new Error(`It is not your turn!`);

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
      if (!gamePiece) throw new Error(`GamePiece with ID ${actionInput.gamePieceId} not found`);
      if (gamePiece.gamePlayerId != gamePlayer.id) throw new Error(`GamePiece ${gamePiece.id} does not belong to you`);

      switch(actionType) {
        case 'move':
          createdGamePieceActions.push(
            await handleMoveAction(gamePlayer, gamePhase, gamePiece, actionInput.moveInput, t)
          );
          break;
        case 'rangedAttack':
          createdGamePieceActions.push(
            await handleRangedAttackAction(gamePlayer, gamePhase, gamePiece, actionInput.rangedAttackInput, t)
          )
          break;
        case 'meleeAttack':
          createdGamePieceActions.push(
            await handleMeleeAttackAction(gamePlayer, gamePhase, gamePiece, actionInput.meleeAttackInput, t)
          )
          break;
      }
    }
    return createdGamePieceActions;
  });
}

async function handleMoveAction(
  gamePlayer: Models.GamePlayer,
  gamePhase: Models.GamePhase,
  gamePiece: Models.GamePiece,
  moveInput: Types.GamePieceMoveActionInput,
  transaction
): Promise<Models.GamePieceAction> {
  const currentPos = gamePiece.coordinates();
  const moveFrom = moveInput.moveFrom;
  const moveTo = moveInput.moveTo;

  // Confirm that they're moving it from its current position
  if (moveFrom.x != currentPos.x || moveFrom.y != currentPos.y) {
    throw new Error(
      `GamePiece ${gamePiece.id} is at ${JSON.stringify(currentPos)} ` +
      `but you are attempting to move it from ${JSON.stringify(moveFrom)}`
    );
  }
  
  // Confirm that they're moving it within its max range
  const moveValidityResult = await gamePiece.checkMoveValidity(moveTo);
  if (!moveValidityResult.valid) {
    if (moveValidityResult.invalidReason == 'beyondMaxRange') {
      throw new Error(
        `GamePiece ${gamePiece.id} cannot be moved from ${JSON.stringify(currentPos)} to ${JSON.stringify(moveTo)} ` +
        `because the distance is ${moveValidityResult.distance} its movement speed is ${moveValidityResult.movementSpeed}`
      );
    }
    if (moveValidityResult.invalidReason == 'collidesWithOtherPiece') {
      throw new Error(
        `GamePiece ${gamePiece.id} cannot be moved from ${JSON.stringify(currentPos)} ` +
        `to ${JSON.stringify(moveTo)} because this collides with another GamePiece`
      );
    }
  }
  return await Models.GamePieceAction.create(
    {
      gamePhaseId: gamePhase.id,
      gamePlayerId: gamePlayer.id,
      gamePieceId: gamePiece.id,
      actionType: 'move',
      actionData: {
        actionType: 'move',
        moveFrom: currentPos,
        moveTo: moveTo
      }
    },
    { transaction: transaction }
  );
}

async function handleRangedAttackAction(
  gamePlayer: Models.GamePlayer,
  gamePhase: Models.GamePhase,
  gamePiece: Models.GamePiece,
  rangedAttackInput: Types.GamePieceRangedAttackActionInput,
  transaction
): Promise<Models.GamePieceAction> {
    // Confirm target GamePiece exists and is a valid target
    const targetGamePiece = await Models.GamePiece.findByPk(rangedAttackInput.targetGamePieceId, { transaction: transaction });
    if (!targetGamePiece) throw new Error(`No GamePiece found for targetGamePieceId ${rangedAttackInput.targetGamePieceId}`);
    if (targetGamePiece.gameId != gamePiece.gameId) throw new Error(`Target GamePiece ${targetGamePiece.id} is not in the same Game as attacking GamePiece ${gamePiece.id}`);
    if (targetGamePiece.gamePlayerId == gamePiece.gamePlayerId) throw new Error(`Target GamePiece ${targetGamePiece.id} is on the same team as attacking GamePiece ${gamePiece.id}`);
  
    // Confirm attacking GamePiece can perform ranged attacks
    const playerUnit = await Models.PlayerUnit.findByPk(gamePiece.playerUnitId, { transaction: transaction });
    const unit = await Models.Unit.findByPk(playerUnit.unitId, { transaction: transaction });
    // TODO: For now only Units with name "Archer" can perform ranged attacks
    if (unit.name != 'Archer') throw new Error(`GamePiece ${gamePiece.id} of Unit "${unit.name}" cannot perform ranged attacks`);

    // Confirm target GamePiece is in range, use const range for melee for now
    const distanceToTarget = gamePiece.distanceTo(targetGamePiece.coordinates());
    const attackerRange = RANGED_ATTACK_RANGE;
    if (distanceToTarget > attackerRange) throw new Error(`GamePiece ${gamePiece.id} cannot execute a ranged attack against target GamePiece ${targetGamePiece.id} because distance ${distanceToTarget} is greater than attacker's max range of ${attackerRange}`);
  
    return await Models.GamePieceAction.create(
      {
        gamePhaseId: gamePhase.id,
        gamePlayerId: gamePlayer.id,
        gamePieceId: gamePiece.id,
        actionType: 'rangedAttack',
        actionData: {
          actionType: 'rangedAttack',
          targetGamePieceId: targetGamePiece.id,
        }
      },
      { transaction: transaction }
    );
}

async function handleMeleeAttackAction(
  gamePlayer: Models.GamePlayer,
  gamePhase: Models.GamePhase,
  gamePiece: Models.GamePiece,
  rangedAttackInput: Types.GamePieceMeleeAttackActionInput,
  transaction
): Promise<Models.GamePieceAction> {
  // Confirm target GamePiece exists and is a valid target
  const targetGamePiece = await Models.GamePiece.findByPk(rangedAttackInput.targetGamePieceId, { transaction: transaction });
  if (!targetGamePiece) throw new Error(`No GamePiece found for targetGamePieceId ${rangedAttackInput.targetGamePieceId}`);
  if (targetGamePiece.gameId != gamePiece.gameId) throw new Error(`Target GamePiece ${targetGamePiece.id} is not in the same Game as attacking GamePiece ${gamePiece.id}`);
  if (targetGamePiece.gamePlayerId == gamePiece.gamePlayerId) throw new Error(`Target GamePiece ${targetGamePiece.id} is on the same team as attacking GamePiece ${gamePiece.id}`);

  // Confirm target GamePiece is in range, use const range for melee for now
  const distanceToTarget = gamePiece.distanceTo(targetGamePiece.coordinates());
  const attackerRange = MELEE_ATTACK_RANGE;
  if (distanceToTarget > attackerRange) throw new Error(`GamePiece ${gamePiece.id} cannot execute a melee attack against target GamePiece ${targetGamePiece.id} because distance ${distanceToTarget} is greater than attacker's max range of ${attackerRange}`);

  return await Models.GamePieceAction.create(
    {
      gamePhaseId: gamePhase.id,
      gamePlayerId: gamePlayer.id,
      gamePieceId: gamePiece.id,
      actionType: 'meleeAttack',
      actionData: {
        actionType: 'meleeAttack',
        targetGamePieceId: targetGamePiece.id,
      }
    },
    { transaction: transaction }
  );
}
