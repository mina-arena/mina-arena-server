import * as Models from '../../models/index.js';
import resolveAttacks from './attack_resolver.js';
export async function validateRangedAttackAction(attackingGamePiece, targetGamePieceId, resolving, transaction) {
    // Confirm target GamePiece exists and is a valid target
    const targetGamePiece = await Models.GamePiece.findByPk(targetGamePieceId, { transaction });
    if (!targetGamePiece)
        throw new Error(`No GamePiece found for targetGamePieceId ${targetGamePieceId}`);
    if (targetGamePiece.gameId != attackingGamePiece.gameId)
        throw new Error(`Target GamePiece ${targetGamePiece.id} is not in the same Game as attacking GamePiece ${attackingGamePiece.id}`);
    if (targetGamePiece.gamePlayerId == attackingGamePiece.gamePlayerId)
        throw new Error(`Target GamePiece ${targetGamePiece.id} is on the same team as attacking GamePiece ${attackingGamePiece.id}`);
    // Confirm attacking GamePiece can perform ranged attacks
    const attackingPlayerUnit = await Models.PlayerUnit.findByPk(attackingGamePiece.playerUnitId, { transaction });
    const attackingUnit = await Models.Unit.findByPk(attackingPlayerUnit.unitId, { transaction });
    if (!attackingUnit.canMakeRangedAttack())
        throw new Error(`GamePiece ${attackingGamePiece.id} of Unit "${attackingUnit.name}" cannot perform ranged attacks`);
    // Confirm target GamePiece is in range
    const distanceToTarget = attackingGamePiece.distanceTo(targetGamePiece.coordinates());
    if (distanceToTarget > attackingUnit.rangedRange)
        throw new Error(`GamePiece ${attackingGamePiece.id} cannot execute a ranged attack against target GamePiece ${targetGamePiece.id} because distance ${distanceToTarget} is greater than attacker's max range of ${attackingUnit.rangedRange}`);
    if (!resolving) {
        // Any validation which should only be performed in dry runs
        if (targetGamePiece.isDead())
            throw new Error(`Target GamePiece ${targetGamePieceId} is already dead`);
    }
    return {
        targetGamePiece,
        attackingPlayerUnit,
        attackingUnit,
        distanceToTarget
    };
}
export default async function resolveRangedAttackAction(action, transaction) {
    const actionData = action.actionData;
    if (actionData.actionType !== 'rangedAttack')
        throw new Error(`Unable to resolve ranged attack action with actionType: ${actionData.actionType}`);
    const attackingGamePiece = await action.gamePiece();
    const targetGamePieceId = actionData.targetGamePieceId;
    // Validate action inputs and capture queried data
    const { targetGamePiece, attackingUnit, } = await validateRangedAttackAction(attackingGamePiece, targetGamePieceId, true, transaction);
    // If target is already dead just abort
    if (targetGamePiece.isDead())
        return;
    const targetPlayerUnit = await Models.PlayerUnit.findByPk(targetGamePiece.playerUnitId, { transaction });
    const targetUnit = await Models.Unit.findByPk(targetPlayerUnit.unitId, { transaction });
    // Resolve attack sequence
    const encodedDiceRolls = actionData.encodedDiceRolls;
    const resolvedAttacks = resolveAttacks(attackingUnit.rangedNumAttacks, attackingUnit.rangedHitRoll, attackingUnit.rangedWoundRoll, targetUnit.armorSaveRoll, attackingUnit.rangedArmorPiercing, attackingUnit.rangedDamage, encodedDiceRolls);
    const totalDamage = resolvedAttacks.reduce((sum, attack) => sum + attack.damageDealt, 0);
    // Update target GamePiece with damage dealt
    if (totalDamage > 0) {
        const newHealth = Math.max(targetGamePiece.health - totalDamage, 0);
        targetGamePiece.health = newHealth;
        await targetGamePiece.save({ transaction });
    }
    // Update action record as resolved
    let newActionData = JSON.parse(JSON.stringify(actionData));
    newActionData.resolved = true;
    newActionData.resolvedAttacks = resolvedAttacks;
    action.actionData = newActionData;
    await action.save({ transaction });
}
//# sourceMappingURL=ranged_attack_resolver.js.map