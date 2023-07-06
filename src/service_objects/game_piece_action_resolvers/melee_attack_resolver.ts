import * as Models from '../../models/index.js';
import { EncrytpedAttackRoll, MELEE_ATTACK_RANGE } from 'mina-arena-contracts';
import resolveAttacks from './attack_resolver.js';
import { Transaction } from 'sequelize';
import serializePiecesTree from '../mina/pieces_tree_serializer.js';
import serializeArenaTree from '../mina/arena_tree_serializer.js';
import { Action, PhaseState, DecrytpedAttackRoll } from 'mina-arena-contracts';
import {
  Field,
  PublicKey,
  UInt32,
  Signature,
  PrivateKey,
  Encryption,
  Group,
} from 'snarkyjs';
import dotenv from 'dotenv';

dotenv.config();

export type ValidateMeleeAttackActionResult = {
  targetGamePiece: Models.GamePiece;
  attackingPlayerUnit: Models.PlayerUnit;
  attackingUnit: Models.Unit;
  distanceToTarget: number;
};

export async function validateMeleeAttackAction(
  attackingGamePiece: Models.GamePiece,
  targetGamePieceId: number,
  resolving: Boolean,
  transaction?: Transaction
): Promise<ValidateMeleeAttackActionResult> {
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

  // Confirm target GamePiece is in range
  const distanceToTarget = attackingGamePiece.distanceTo(
    targetGamePiece.coordinates()
  );
  console.log(distanceToTarget);
  if (distanceToTarget > MELEE_ATTACK_RANGE)
    throw new Error(
      `GamePiece ${attackingGamePiece.id} cannot execute a melee attack against target GamePiece ${targetGamePiece.id} because distance ${distanceToTarget} is greater than melee range of ${MELEE_ATTACK_RANGE}`
    );

  if (!resolving) {
    // Any validation which should only be performed in dry runs
    if (targetGamePiece.isDead())
      throw new Error(`Target GamePiece ${targetGamePieceId} is already dead`);
  }

  // Fetch some additional info
  const attackingPlayerUnit = await Models.PlayerUnit.findByPk(
    attackingGamePiece.playerUnitId,
    { transaction }
  );
  const attackingUnit = await Models.Unit.findByPk(attackingPlayerUnit.unitId, {
    transaction,
  });

  return {
    targetGamePiece,
    attackingPlayerUnit,
    attackingUnit,
    distanceToTarget,
  };
}

export default async function resolveMeleeAttackAction(
  action: Models.GamePieceAction,
  transaction?: Transaction
): Promise<Models.GamePiece> {
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
  if (actionData.actionType !== 'meleeAttack')
    throw new Error(
      `Unable to resolve melee attack action with actionType: ${actionData.actionType}`
    );

  const targetGamePieceId = actionData.targetGamePieceId;

  // Validate action inputs and capture queried data
  const { targetGamePiece, attackingUnit } = await validateMeleeAttackAction(
    attackingGamePiece,
    targetGamePieceId,
    true,
    transaction
  );

  // If target is already dead just abort
  if (targetGamePiece.isDead()) return;

  const attackingPlayerUnit = await Models.PlayerUnit.findByPk(
    attackingGamePiece.playerUnitId,
    { transaction }
  );
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
  const snarkyAction = new Action(
    Field(1),
    Field(0),
    actionParam,
    snarkyAttackingPiece.id
  );

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

      stateAfterAttack = snarkyGameState.applyMeleeAttackAction(
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
      `Successfully applied snarky melee attack action ${JSON.stringify(
        actionData
      )} to game ${attackingGamePiece.gameId} attacking piece ${
        attackingGamePiece.id
      }, target piece ${targetGamePiece.id}`
    );
  } catch (e) {
    console.warn(
      `Unable to apply snarky melee attack action ${JSON.stringify(
        actionData
      )} to game ${attackingGamePiece.gameId} attacking piece ${
        attackingGamePiece.id
      }, target piece ${targetGamePiece.id} - ${e}`
    );
  }

  const roll = attackRolls[0];
  const snarkyRoll = new EncrytpedAttackRoll({
    publicKey: Group.fromJSON(roll.publicKey),
    ciphertext: roll.ciphertext.map((c) => Field(c)),
    signature: Signature.fromJSON(roll.signature),
    rngPublicKey: PublicKey.fromBase58(roll.rngPublicKey),
  });
  const decryptedRoll = snarkyRoll.decryptRoll(
    PrivateKey.fromBase58(process.env.SERVER_PRIVATE_KEY)
  );
  const decryptedRollJSON = {
    hit: Number(decryptedRoll.hit.toString()),
    wound: Number(decryptedRoll.wound.toString()),
    save: Number(decryptedRoll.save.toString()),
  };

  const resolvedAttacks = resolveAttacks(
    attackingUnit.meleeNumAttacks,
    attackingUnit.meleeHitRoll,
    attackingUnit.meleeWoundRoll,
    targetUnit.armorSaveRoll,
    attackingUnit.meleeArmorPiercing,
    attackingUnit.meleeDamage,
    attackRolls
  );

  const totalDamageDealt = resolvedAttacks.reduce(
    (sum, attack) => sum + attack.damageDealt,
    0
  );
  const totalDamageAverage = resolvedAttacks.reduce(
    (sum, attack) => sum + attack.averageDamage,
    0
  );

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
