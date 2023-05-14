import * as Models from '../../models/index.js';
import { diceRoll } from '../../graphql/helpers.js';
import { EncodedDiceRolls, ResolvedAttack } from '../../models/game_piece_action.js';

export default function resolveAttacks(
  numAttacks: number,
  attackerHitRollStat: number,
  attackerWoundRollStat: number,
  targetSaveRollStat: number,
  attackerArmorPiercingStat: number,
  attackerDamageStat: number,
  encodedDiceRolls: EncodedDiceRolls
): ResolvedAttack[] {
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

    attacks.push({
      hitRoll: { roll: hitRoll, success: hitRollSuccess },
      woundRoll: { roll: woundRoll, success: woundRollSuccess },
      saveRoll: { roll: saveRoll, success: saveRollSuccess },
      damageDealt: damageDealt
    });
  }
  return attacks;
}

// Simulate the attack sequence
function simulateDiceRolls(numAttacks: number): number[] {
  let rolls = [];
  for (var i = 0; i < numAttacks; i++) {
    rolls.push(diceRoll()); // hit roll
    rolls.push(diceRoll()); // wound roll
    rolls.push(diceRoll()); // save roll
  }
  return rolls;
}
