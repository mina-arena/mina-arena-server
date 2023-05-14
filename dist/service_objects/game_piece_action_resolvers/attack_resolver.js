import { diceRoll } from '../../graphql/helpers';
export default function resolveAttacks(attackingUnit, targetUnit, encodedDiceRolls) {
    // TODO: Decode dice roll results using private key
    //  For now just simulate rolls here
    const decodedDiceRolls = simulateDiceRolls(attackingUnit.rangedNumAttacks);
    // Gather details of each attack and determine damage
    let attacks = [];
    let totalDamage = 0;
    for (var i = 0; i < attackingUnit.rangedNumAttacks; i++) {
        const rollsOffset = i * 3;
        const hitRoll = decodedDiceRolls[rollsOffset];
        const woundRoll = decodedDiceRolls[rollsOffset + 1];
        const saveRoll = decodedDiceRolls[rollsOffset + 2];
        const hitRollSuccess = hitRoll >= attackingUnit.rangedHitRoll;
        const woundRollSuccess = woundRoll >= attackingUnit.rangedWoundRoll;
        const armorPiercing = attackingUnit.rangedArmorPiercing || 0;
        const modifiedSave = targetUnit.armorSaveRoll + armorPiercing;
        const saveRollSuccess = saveRoll >= modifiedSave;
        const damageDealt = hitRollSuccess && woundRollSuccess && !saveRollSuccess ? attackingUnit.rangedDamage : 0;
        attacks.push({
            hitRoll: { roll: hitRoll, success: hitRollSuccess },
            woundRoll: { roll: woundRoll, success: woundRollSuccess },
            saveRoll: { roll: saveRoll, success: saveRollSuccess },
            damageDealt: damageDealt
        });
        if (damageDealt > 0)
            totalDamage += damageDealt;
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