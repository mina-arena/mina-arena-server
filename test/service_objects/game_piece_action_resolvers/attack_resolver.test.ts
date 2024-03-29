import resolveAttack from '../../../src/service_objects/game_piece_action_resolvers/attack_resolver';
import { EncrytpedAttackRollJSON } from '../../../src/models/game_piece_action';
import { roll_6_6_1 } from '../../support/dice_rolls';

describe('resolveAttack', () => {
  let numAttacks: number;
  let attackerHitRollStat: number;
  let attackerWoundRollStat: number;
  let targetSaveRollStat: number;
  let attackerArmorPiercingStat: number;
  let attackerDamageStat: number;
  let encryptedAttackRoll: EncrytpedAttackRollJSON;

  beforeEach(async () => {
    numAttacks = 100;
    attackerHitRollStat = 3;
    attackerWoundRollStat = 4;
    targetSaveRollStat = 3;
    attackerArmorPiercingStat = 1;
    attackerDamageStat = 1;

    encryptedAttackRoll = roll_6_6_1;
  });

  it('resolves attack sequences correctly', async () => {
    const resolvedAttack = resolveAttack(
      numAttacks,
      attackerHitRollStat,
      attackerWoundRollStat,
      targetSaveRollStat,
      attackerArmorPiercingStat,
      attackerDamageStat,
      encryptedAttackRoll
    );
    expect(resolvedAttack.hitRoll.rollNeeded).toBe(attackerHitRollStat);
    expect(resolvedAttack.woundRoll.rollNeeded).toBe(attackerWoundRollStat);
    expect(resolvedAttack.saveRoll.rollNeeded).toBe(
      targetSaveRollStat + attackerArmorPiercingStat
    );

    const oddsOfHitting = (7 - attackerHitRollStat) / 6;
    const oddsOfWounding = (7 - attackerWoundRollStat) / 6;
    const modifiedSave = targetSaveRollStat + attackerArmorPiercingStat;
    const oddsOfPassingArmorSave = Math.max(7 - modifiedSave, 0) / 6;
    const expectedAverageDamage = (
      oddsOfHitting *
      oddsOfWounding *
      (1 - oddsOfPassingArmorSave) *
      attackerDamageStat
    ).toFixed(2);
    expect(resolvedAttack.averageDamage.toFixed(2)).toBe(expectedAverageDamage);

    if (resolvedAttack.hitRoll.roll >= attackerHitRollStat) {
      expect(resolvedAttack.hitRoll.success).toBe(true);
    } else {
      expect(resolvedAttack.hitRoll.success).toBe(false);
      expect(resolvedAttack.damageDealt).toBe(0);
    }
    if (resolvedAttack.woundRoll.roll >= attackerWoundRollStat) {
      expect(resolvedAttack.woundRoll.success).toBe(true);
    } else {
      expect(resolvedAttack.woundRoll.success).toBe(false);
      expect(resolvedAttack.damageDealt).toBe(0);
    }
    if (
      resolvedAttack.saveRoll.roll >=
      targetSaveRollStat + attackerArmorPiercingStat
    ) {
      expect(resolvedAttack.saveRoll.success).toBe(true);
      expect(resolvedAttack.damageDealt).toBe(0);
    } else {
      expect(resolvedAttack.saveRoll.success).toBe(false);
    }
    if (
      resolvedAttack.hitRoll.success &&
      resolvedAttack.woundRoll.success &&
      !resolvedAttack.saveRoll.success
    ) {
      expect(resolvedAttack.damageDealt).toBe(attackerDamageStat);
    }
  });
});
