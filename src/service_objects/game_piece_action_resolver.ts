import * as Models from '../models/index.js';
import sequelizeConnection from '../db/config.js';
import { GamePieceMoveAction, GamePieceRangedAttackAction, GamePieceMeleeAttackAction } from '../models/game_piece_action.js';
import { RANGED_ATTACK_RANGE, MELEE_ATTACK_RANGE } from '../models/unit.js';
import { GamePieceCoordinates } from '../graphql/__generated__/resolvers-types.js';

export default async (
  action: Models.GamePieceAction,
  commitChanges: boolean = false,
  parentTransaction
): Promise<Models.GamePiece> => {
  // Resolving an individual action uses its own sub-transaction.
  // This is because each action needs to know the results of
  // the actions resolved before it, for example if a GamePiece
  // is attempting to attack an enemy GamePiece which has
  // already been destroyed by an earlier action.
  return await sequelizeConnection.transaction(async (t) => {
    let gamePiece = await Models.GamePiece.findByPk(action.gamePieceId, { transaction: t })

    switch(action.actionData.actionType) {
      case 'move':
        gamePiece = await resolveMoveAction(
          gamePiece,
          action.actionData.moveFrom,
          action.actionData.moveTo,
          commitChanges,
          t
        );
        break;
      case 'rangedAttack':
        gamePiece = await resolveRangedAttackAction(
          gamePiece,
          action.actionData.targetGamePieceId,
          commitChanges,
          t
        );
        break;
      case 'meleeAttack':
        gamePiece = await resolveMeleeAttackAction(
          gamePiece,
          action.actionData.targetGamePieceId,
          commitChanges,
          t
        );
        break;
    }
    return gamePiece;
  });
}

export async function resolveMoveAction(
  gamePiece: Models.GamePiece,
  moveFrom: GamePieceCoordinates,
  moveTo: GamePieceCoordinates,
  commitChanges: boolean = false,
  transaction
): Promise<Models.GamePiece> {
  const currentPos = gamePiece.coordinates();

  if (moveFrom.x != currentPos.x || moveFrom.y != currentPos.y) {
    throw new Error(
      `GamePiece ${gamePiece.id} is at ${JSON.stringify(currentPos)} ` +
      `but you are attempting to move it from ${JSON.stringify(moveFrom)}`
    );
  }
  
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

  if (commitChanges) {
    // Validations done, modify state
    gamePiece.positionX = moveTo.x;
    gamePiece.positionY = moveTo.y;
    await gamePiece.save({ transaction: transaction });
  }
  return gamePiece;
}

export async function resolveRangedAttackAction(
  attackingGamePiece: Models.GamePiece,
  targetGamePieceId: string | number,
  commitChanges: boolean = false,
  transaction
): Promise<Models.GamePiece> {
  // Confirm target GamePiece exists and is a valid target
  const targetGamePiece = await Models.GamePiece.findByPk(targetGamePieceId, { transaction: transaction });
  if (!targetGamePiece) throw new Error(`No GamePiece found for targetGamePieceId ${targetGamePieceId}`);
  if (targetGamePiece.gameId != attackingGamePiece.gameId) throw new Error(`Target GamePiece ${targetGamePiece.id} is not in the same Game as attacking GamePiece ${attackingGamePiece.id}`);
  if (targetGamePiece.gamePlayerId == attackingGamePiece.gamePlayerId) throw new Error(`Target GamePiece ${targetGamePiece.id} is on the same team as attacking GamePiece ${attackingGamePiece.id}`);

  // Confirm attacking GamePiece can perform ranged attacks
  const attackingPlayerUnit = await Models.PlayerUnit.findByPk(attackingGamePiece.playerUnitId, { transaction: transaction });
  const attackingUnit = await Models.Unit.findByPk(attackingPlayerUnit.unitId, { transaction: transaction });
  // TODO: For now only Units with name "Archer" can perform ranged attacks
  if (attackingUnit.name != 'Archer') throw new Error(`GamePiece ${attackingGamePiece.id} of Unit "${attackingUnit.name}" cannot perform ranged attacks`);

  // Confirm target GamePiece is in range, use const range for melee for now
  const distanceToTarget = attackingGamePiece.distanceTo(targetGamePiece.coordinates());
  const attackerRange = RANGED_ATTACK_RANGE;
  if (distanceToTarget > attackerRange) throw new Error(`GamePiece ${attackingGamePiece.id} cannot execute a ranged attack against target GamePiece ${targetGamePiece.id} because distance ${distanceToTarget} is greater than attacker's max range of ${attackerRange}`);

  if (commitChanges) {
    // Validations done, modify state
    if (targetGamePiece.isDead()) return attackingGamePiece;
  
    const targetPlayerUnit = await Models.PlayerUnit.findByPk(targetGamePiece.playerUnitId, { transaction: transaction });
    const targetUnit = await Models.Unit.findByPk(targetPlayerUnit.unitId, { transaction: transaction });

    const damageSubtotal = attackingUnit.attackPower - targetUnit.armor;
    const damage = Math.min(damageSubtotal, 1);
    const newHealth = Math.max(targetGamePiece.health - damage, 0);
    targetGamePiece.health = newHealth;
    await targetGamePiece.save({ transaction: transaction });
  } else {
    // Any validation which should only be performed in dry runs
    if (targetGamePiece.isDead()) throw new Error(`Target GamePiece ${targetGamePieceId} is already dead`);
  }

  return attackingGamePiece;
}

export async function resolveMeleeAttackAction(
  attackingGamePiece: Models.GamePiece,
  targetGamePieceId: string | number,
  commitChanges: boolean = false,
  transaction
): Promise<Models.GamePiece> {
  // Confirm target GamePiece exists and is a valid target
  const targetGamePiece = await Models.GamePiece.findByPk(targetGamePieceId, { transaction: transaction });
  if (!targetGamePiece) throw new Error(`No GamePiece found for targetGamePieceId ${targetGamePieceId}`);
  if (targetGamePiece.gameId != attackingGamePiece.gameId) throw new Error(`Target GamePiece ${targetGamePiece.id} is not in the same Game as attacking GamePiece ${attackingGamePiece.id}`);
  if (targetGamePiece.gamePlayerId == attackingGamePiece.gamePlayerId) throw new Error(`Target GamePiece ${targetGamePiece.id} is on the same team as attacking GamePiece ${attackingGamePiece.id}`);

  // Confirm target GamePiece is in range, use const range for melee for now
  const distanceToTarget = attackingGamePiece.distanceTo(targetGamePiece.coordinates());
  const attackerRange = MELEE_ATTACK_RANGE;
  if (distanceToTarget > attackerRange) throw new Error(`GamePiece ${attackingGamePiece.id} cannot execute a melee attack against target GamePiece ${targetGamePiece.id} because distance ${distanceToTarget} is greater than attacker's max range of ${attackerRange}`);

  if (commitChanges) {
    // Validations done, modify state
    if (targetGamePiece.isDead()) return attackingGamePiece;
  
    const attackingPlayerUnit = await Models.PlayerUnit.findByPk(attackingGamePiece.playerUnitId, { transaction: transaction });
    const attackingUnit = await Models.Unit.findByPk(attackingPlayerUnit.unitId, { transaction: transaction });
    const targetPlayerUnit = await Models.PlayerUnit.findByPk(targetGamePiece.playerUnitId, { transaction: transaction });
    const targetUnit = await Models.Unit.findByPk(targetPlayerUnit.unitId, { transaction: transaction });

    const damageSubtotal = attackingUnit.attackPower - targetUnit.armor;
    const damage = Math.max(damageSubtotal, 1);
    const newHealth = Math.max(targetGamePiece.health - damage, 0);
    targetGamePiece.health = newHealth;
    await targetGamePiece.save({ transaction: transaction });
  } else {
    // Any validation which should only be performed in dry runs
    if (targetGamePiece.isDead()) throw new Error(`Target GamePiece ${targetGamePieceId} is already dead`);
  }

  return attackingGamePiece;
}
