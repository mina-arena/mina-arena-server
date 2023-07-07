import * as Models from '../../models/index.js';
import resolveAttacks from './attack_resolver.js';
import { Transaction } from 'sequelize';
import serializePiecesTree from '../mina/pieces_tree_serializer.js';
import serializeArenaTree from '../mina/arena_tree_serializer.js';
import { Action, PhaseState, EncrytpedAttackRoll } from 'mina-arena-contracts';
import {
  Field,
  PublicKey,
  UInt32,
  Signature,
  PrivateKey,
  Group,
} from 'snarkyjs';
import dotenv from 'dotenv';

dotenv.config();

export type ValidateRangedAttackActionResult = {
  targetGamePiece: Models.GamePiece;
  attackingPlayerUnit: Models.PlayerUnit;
  attackingUnit: Models.Unit;
  distanceToTarget: number;
};

export async function validateRangedAttackAction(
  attackingGamePiece: Models.GamePiece,
  targetGamePieceId: number,
  resolving: Boolean,
  transaction?: Transaction
): Promise<ValidateRangedAttackActionResult> {
  // Confirm target GamePiece exists and is a valid target
  const targetGamePiece = await Models.GamePiece.findByPk(targetGamePieceId, {
    transaction,
  });
  if (!targetGamePiece)
    throw new Error(
      `No GamePiece found for targetGamePieceId ${targetGamePieceId}`
    );
  if (targetGamePiece.gameId != attackingGamePiece.gameId)
    throw new Error(
      `Target GamePiece ${targetGamePiece.id} is not in the same Game as attacking GamePiece ${attackingGamePiece.id}`
    );
  if (targetGamePiece.gamePlayerId == attackingGamePiece.gamePlayerId)
    throw new Error(
      `Target GamePiece ${targetGamePiece.id} is on the same team as attacking GamePiece ${attackingGamePiece.id}`
    );

  // Confirm attacking GamePiece can perform ranged attacks
  const attackingPlayerUnit = await Models.PlayerUnit.findByPk(
    attackingGamePiece.playerUnitId,
    { transaction }
  );
  const attackingUnit = await Models.Unit.findByPk(attackingPlayerUnit.unitId, {
    transaction,
  });
  if (!attackingUnit.canMakeRangedAttack())
    throw new Error(
      `GamePiece ${attackingGamePiece.id} of Unit "${attackingUnit.name}" cannot perform ranged attacks`
    );

  // Confirm target GamePiece is in range
  const distanceToTarget = attackingGamePiece.distanceTo(
    targetGamePiece.coordinates()
  );
  if (distanceToTarget > attackingUnit.rangedRange)
    throw new Error(
      `GamePiece ${attackingGamePiece.id} cannot execute a ranged attack against target GamePiece ${targetGamePiece.id} because distance ${distanceToTarget} is greater than attacker's max range of ${attackingUnit.rangedRange}`
    );

  if (!resolving) {
    // Any validation which should only be performed in dry runs
    if (targetGamePiece.isDead())
      throw new Error(`Target GamePiece ${targetGamePieceId} is already dead`);
  }

  return {
    targetGamePiece,
    attackingPlayerUnit,
    attackingUnit,
    distanceToTarget,
  };
}

export default async function resolveRangedAttackAction(
  action: Models.GamePieceAction,
  transaction?: Transaction
) {
  const attackingGamePiece = await action.gamePiece();

  const playerPublicKeyString = (
    await (await attackingGamePiece.gamePlayer()).player()
  ).minaPublicKey;
  const playerPublicKey = PublicKey.fromBase58(playerPublicKeyString);

  const startingGamePiecesTree = await serializePiecesTree(
    attackingGamePiece.gameId
  );
  const startingGameArenaTree = await serializeArenaTree(
    attackingGamePiece.gameId
  );

  const snarkyGameState = new PhaseState({
    nonce: Field(0),
    actionsNonce: Field(0),
    startingPiecesState: startingGamePiecesTree.tree.getRoot(),
    currentPiecesState: startingGamePiecesTree.tree.getRoot(),
    startingArenaState: startingGameArenaTree.tree.getRoot(),
    currentArenaState: startingGameArenaTree.tree.getRoot(),
    playerPublicKey,
  });

  const actionData = action.actionData;
  if (actionData.actionType !== 'rangedAttack')
    throw new Error(
      `Unable to resolve ranged attack action with actionType: ${actionData.actionType}`
    );

  const targetGamePieceId = actionData.targetGamePieceId;

  // Validate action inputs and capture queried data
  const { targetGamePiece, attackingUnit } = await validateRangedAttackAction(
    attackingGamePiece,
    targetGamePieceId,
    true,
    transaction
  );

  // If target is already dead just abort
  if (targetGamePiece.isDead()) return;

  const targetPlayerUnit = await Models.PlayerUnit.findByPk(
    targetGamePiece.playerUnitId,
    { transaction }
  );
  const targetUnit = await Models.Unit.findByPk(targetPlayerUnit.unitId, {
    transaction,
  });
  const snarkyAttackingPiece = await attackingGamePiece.toSnarkyPiece();
  const snarkyTargetPiece = await targetGamePiece.toSnarkyPiece();
  const actionParam = Field(snarkyTargetPiece.id);
  const snarkyAction = new Action({
    nonce: Field(1),
    actionType: Field(0),
    actionParams: actionParam,
    piece: snarkyAttackingPiece.id,
  });

  // Attempt to apply the move action to the game state
  // Warn on console for failure
  let snarkySuccess = false;
  let stateAfterAttack: PhaseState;
  const rngPublicKey = PublicKey.fromBase58(process.env.RNG_PUBLIC_KEY);
  const attackRolls = actionData.encryptedAttackRolls;
  try {
    const serverPrivateKey = PrivateKey.fromBase58(
      process.env.SERVER_PRIVATE_KEY
    );

    // For each attack, attempt to apply the attack action
    for (let i = 0; i < attackRolls.length; i++) {
      const roll = new EncrytpedAttackRoll({
        publicKey: Group.fromJSON(attackRolls[i].publicKey),
        ciphertext: attackRolls[i].ciphertext.map((c) => Field(c)),
        signature: Signature.fromJSON(attackRolls[i].signature),
        rngPublicKey: PublicKey.fromBase58(attackRolls[i].rngPublicKey),
      });
      const piecesTreeAfterAttack = startingGamePiecesTree.clone();
      piecesTreeAfterAttack.set(
        snarkyTargetPiece.id.toBigInt(),
        snarkyTargetPiece.hash()
      );

      stateAfterAttack = snarkyGameState.applyRangedAttackAction(
        snarkyAction,
        Signature.fromJSON(action.signature),
        snarkyAttackingPiece,
        snarkyTargetPiece,
        startingGamePiecesTree.getWitness(snarkyAttackingPiece.id.toBigInt()),
        startingGamePiecesTree.getWitness(snarkyTargetPiece.id.toBigInt()),
        UInt32.from(
          Math.floor(
            attackingGamePiece.distanceTo(targetGamePiece.coordinates())
          )
        ),
        roll,
        serverPrivateKey
      );
    }
    snarkySuccess = true;
    console.log(
      `Successfully applied snarky ranged attack action ${JSON.stringify(
        actionData
      )} to game ${attackingGamePiece.gameId} attacking piece ${
        attackingGamePiece.id
      }, target piece ${targetGamePiece.id}`
    );
  } catch (e) {
    console.warn(
      `Unable to apply snarky ranged attack action ${JSON.stringify(
        actionData
      )} to game ${attackingGamePiece.gameId} attacking piece ${
        attackingGamePiece.id
      }, target piece ${targetGamePiece.id} - ${e}`
    );
  }

  console.log('$$', 'Resolving Ranged Attack', {
    numAtks: attackingUnit.rangedNumAttacks,
    hit: attackingUnit.rangedHitRoll,
    wound: attackingUnit.rangedWoundRoll,
    save: targetUnit.armorSaveRoll,
    ap: attackingUnit.rangedArmorPiercing,
    dmg: attackingUnit.rangedDamage,
  });
  // Resolve attack sequence
  let resolvedAttacks;
  try {
    resolvedAttacks = resolveAttacks(
      attackingUnit.rangedNumAttacks,
      attackingUnit.rangedHitRoll,
      attackingUnit.rangedWoundRoll,
      targetUnit.armorSaveRoll,
      attackingUnit.rangedArmorPiercing,
      attackingUnit.rangedDamage,
      attackRolls
    );
  } catch (e) {
    console.log(e);
    throw e;
  }
  console.log('$$', 'Resolved');
  const totalDamageDealt = resolvedAttacks.reduce(
    (sum, attack) => sum + attack.damageDealt,
    0
  );
  const totalDamageAverage = resolvedAttacks.reduce(
    (sum, attack) => sum + attack.averageDamage,
    0
  );
  console.log('$$', 'Damage', totalDamageDealt, totalDamageAverage);

  // Update target GamePiece with damage dealt
  if (totalDamageDealt > 0) {
    const newHealth = Math.max(targetGamePiece.health - totalDamageDealt, 0);
    targetGamePiece.health = newHealth;
    console.log('$$', 'Saving Damage');
    await targetGamePiece.save({ transaction });
    console.log('$$', 'Saved Damage');
  }

  console.log('$$', 'Updating Action to be Resolved');
  // Update action record as resolved
  let newActionData = JSON.parse(JSON.stringify(actionData));
  newActionData.resolved = true;
  newActionData.resolvedAttacks = resolvedAttacks;
  newActionData.totalDamageDealt = totalDamageDealt;
  newActionData.totalDamageAverage = totalDamageAverage;
  action.actionData = newActionData;
  console.log('$$', 'action', action);
  await action.save({ transaction });
  console.log('$$', 'resolved');
}
