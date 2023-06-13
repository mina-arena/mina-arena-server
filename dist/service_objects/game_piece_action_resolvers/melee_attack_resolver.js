import * as Models from '../../models/index.js';
import { MELEE_ATTACK_RANGE } from 'mina-arena-contracts';
import resolveAttacks from './attack_resolver.js';
export async function validateMeleeAttackAction(attackingGamePiece, targetGamePieceId, resolving, transaction) {
    // Confirm target GamePiece exists and is a valid target
    const targetGamePiece = await Models.GamePiece.findByPk(targetGamePieceId, { transaction });
    if (!targetGamePiece)
        throw new Error(`No GamePiece found for targetGamePieceId ${targetGamePieceId}`);
    if (targetGamePiece.gameId != attackingGamePiece.gameId)
        throw new Error(`Target GamePiece ${targetGamePiece.id} is not in the same Game as attacking GamePiece ${attackingGamePiece.id}`);
    if (targetGamePiece.gamePlayerId == attackingGamePiece.gamePlayerId)
        throw new Error(`Target GamePiece ${targetGamePiece.id} is on the same team as attacking GamePiece ${attackingGamePiece.id}`);
    // Confirm target GamePiece is in range
    const distanceToTarget = attackingGamePiece.distanceTo(targetGamePiece.coordinates());
    if (distanceToTarget > MELEE_ATTACK_RANGE)
        throw new Error(`GamePiece ${attackingGamePiece.id} cannot execute a melee attack against target GamePiece ${targetGamePiece.id} because distance ${distanceToTarget} is greater than melee range of ${MELEE_ATTACK_RANGE}`);
    if (!resolving) {
        // Any validation which should only be performed in dry runs
        if (targetGamePiece.isDead())
            throw new Error(`Target GamePiece ${targetGamePieceId} is already dead`);
    }
    // Fetch some additional info
    const attackingPlayerUnit = await Models.PlayerUnit.findByPk(attackingGamePiece.playerUnitId, { transaction });
    const attackingUnit = await Models.Unit.findByPk(attackingPlayerUnit.unitId, { transaction });
    return {
        targetGamePiece,
        attackingPlayerUnit,
        attackingUnit,
        distanceToTarget
    };
}
export default async function resolveMeleeAttackAction(action, transaction) {
    const actionData = action.actionData;
    if (actionData.actionType !== 'meleeAttack')
        throw new Error(`Unable to resolve melee attack action with actionType: ${actionData.actionType}`);
    const attackingGamePiece = await action.gamePiece();
    const targetGamePieceId = actionData.targetGamePieceId;
    // Validate action inputs and capture queried data
    const { targetGamePiece, attackingUnit, } = await validateMeleeAttackAction(attackingGamePiece, targetGamePieceId, true, transaction);
    // If target is already dead just abort
    if (targetGamePiece.isDead())
        return;
    const attackingPlayerUnit = await Models.PlayerUnit.findByPk(attackingGamePiece.playerUnitId, { transaction });
    const targetPlayerUnit = await Models.PlayerUnit.findByPk(targetGamePiece.playerUnitId, { transaction });
    const targetUnit = await Models.Unit.findByPk(targetPlayerUnit.unitId, { transaction });
    // Resolve attack sequence
    const encodedDiceRolls = actionData.encodedDiceRolls;
    const resolvedAttacks = resolveAttacks(attackingUnit.meleeNumAttacks, attackingUnit.meleeHitRoll, attackingUnit.meleeWoundRoll, targetUnit.armorSaveRoll, attackingUnit.meleeArmorPiercing, attackingUnit.meleeDamage, encodedDiceRolls);
    const totalDamageDealt = resolvedAttacks.reduce((sum, attack) => sum + attack.damageDealt, 0);
    const totalDamageAverage = resolvedAttacks.reduce((sum, attack) => sum + attack.averageDamage, 0);
    // Update target GamePiece with damage dealt
    if (totalDamageDealt > 0) {
        const newHealth = Math.max(targetGamePiece.health - totalDamageDealt, 0);
        targetGamePiece.health = newHealth;
        await targetGamePiece.save({ transaction });
    }
    // Update action record as resolved
    let newActionData = JSON.parse(JSON.stringify(actionData));
    newActionData.resolved = true;
    newActionData.resolvedAttacks = resolvedAttacks;
    newActionData.totalDamageDealt = totalDamageDealt;
    newActionData.totalDamageAverage = totalDamageAverage;
    action.actionData = newActionData;
    await action.save({ transaction });
}
//# sourceMappingURL=melee_attack_resolver.js.map