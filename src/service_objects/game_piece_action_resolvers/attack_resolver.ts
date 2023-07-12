import {
  type EncrytpedAttackRollJSON,
  ResolvedAttack,
} from '../../models/game_piece_action.js';

import { PrivateKey, Group, Signature, Field, PublicKey } from 'snarkyjs';
import { EncrytpedAttackRoll } from 'mina-arena-contracts';
import dotenv from 'dotenv';

dotenv.config();

export default function resolveAttack(
  numAttacks: number,
  attackerHitRollStat: number,
  attackerWoundRollStat: number,
  targetSaveRollStat: number,
  attackerArmorPiercingStat: number,
  attackerDamageStat: number,
  attackRolls: EncrytpedAttackRollJSON
): ResolvedAttack {
  const serverPrivateKey = PrivateKey.fromBase58(
    process.env.SERVER_PRIVATE_KEY
  );
  const snarkyRoll = new EncrytpedAttackRoll({
    publicKey: Group.fromJSON(attackRolls.publicKey),
    ciphertext: attackRolls.ciphertext.map((c) => Field(c)),
    signature: Signature.fromJSON(attackRolls.signature),
    rngPublicKey: PublicKey.fromBase58(attackRolls.rngPublicKey),
  });
  const decryptedAttackRolls = snarkyRoll.decryptRoll(serverPrivateKey);

  // Gather details of each attack and determine damage
  const hitRoll = Number(decryptedAttackRolls.hit.toString());
  const woundRoll = Number(decryptedAttackRolls.wound.toString());
  const saveRoll = Number(decryptedAttackRolls.save.toString());

  const hitRollSuccess = hitRoll >= attackerHitRollStat;
  const woundRollSuccess = woundRoll >= attackerWoundRollStat;

  const armorPiercing = attackerArmorPiercingStat || 0;
  const modifiedSave = targetSaveRollStat + armorPiercing;
  const saveRollSuccess = saveRoll >= modifiedSave;

  const damageDealt =
    hitRollSuccess && woundRollSuccess && !saveRollSuccess
      ? attackerDamageStat
      : 0;

  const oddsOfHitting = (7 - attackerHitRollStat) / 6;
  const oddsOfWounding = (7 - attackerWoundRollStat) / 6;
  const oddsOfPassingArmorSave = Math.max(7 - modifiedSave, 0) / 6;
  const averageDamage =
    oddsOfHitting *
    oddsOfWounding *
    (1 - oddsOfPassingArmorSave) *
    attackerDamageStat;

  return {
    hitRoll: {
      roll: hitRoll,
      rollNeeded: attackerHitRollStat,
      success: hitRollSuccess,
    },
    woundRoll: {
      roll: woundRoll,
      rollNeeded: attackerWoundRollStat,
      success: woundRollSuccess,
    },
    saveRoll: {
      roll: saveRoll,
      rollNeeded: modifiedSave,
      success: saveRollSuccess,
    },
    damageDealt: damageDealt,
    averageDamage: averageDamage,
  };
}
