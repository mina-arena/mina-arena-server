import { diceRoll } from '../../graphql/helpers.js';
export default function resolveAttacks(numAttacks, attackerHitRollStat, attackerWoundRollStat, targetSaveRollStat, attackerArmorPiercingStat, attackerDamageStat, encodedDiceRolls) {
    // TODO: Decode dice roll results using private key
    //  For now just simulate rolls here
    const decodedDiceRolls = simulateDiceRolls(numAttacks);
    // Gather details of each attack and determine damage
    let attacks = [];
    for (var i = 0; i < numAttacks; i++) {
        const rollsOffset = i * 3;
        const hitRoll = decodedDiceRolls[rollsOffset];
        const woundRoll = decodedDiceRolls[rollsOffset + 1];
        const saveRoll = decodedDiceRolls[rollsOffset + 2];
        const hitRollSuccess = hitRoll >= attackerHitRollStat;
        const woundRollSuccess = woundRoll >= attackerWoundRollStat;
        const armorPiercing = attackerArmorPiercingStat || 0;
        const modifiedSave = targetSaveRollStat + armorPiercing;
        const saveRollSuccess = saveRoll >= modifiedSave;
        const damageDealt = hitRollSuccess && woundRollSuccess && !saveRollSuccess ? attackerDamageStat : 0;
        const oddsOfHitting = ((7 - attackerHitRollStat) / 6);
        const oddsOfWounding = ((7 - attackerWoundRollStat) / 6);
        const oddsOfPassingArmorSave = (Math.max(7 - modifiedSave, 0) / 6);
        const averageDamage = (oddsOfHitting * oddsOfWounding * (1 - oddsOfPassingArmorSave) * attackerDamageStat).toFixed(2);
        attacks.push({
            hitRoll: {
                roll: hitRoll,
                rollNeeded: attackerHitRollStat,
                success: hitRollSuccess
            },
            woundRoll: {
                roll: woundRoll,
                rollNeeded: attackerWoundRollStat,
                success: woundRollSuccess
            },
            saveRoll: {
                roll: saveRoll,
                rollNeeded: modifiedSave,
                success: saveRollSuccess
            },
            damageDealt: damageDealt,
            averageDamage: averageDamage,
        });
    }
    return attacks;
}
// Simulate the attack sequence
function simulateDiceRolls(numAttacks) {
    let rolls = [];
    for (var i = 0; i < numAttacks; i++) {
        rolls.push(diceRoll()); // hit roll
        rolls.push(diceRoll()); // wound roll
        rolls.push(diceRoll()); // save roll
    }
    return rolls;
}
//# sourceMappingURL=attack_resolver.js.map