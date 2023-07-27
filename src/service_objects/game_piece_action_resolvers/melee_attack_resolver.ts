import * as Models from '../../models/index.js';
import {
  ArenaMerkleTree,
  EncrytpedAttackRoll,
  MELEE_ATTACK_RANGE,
  PiecesMerkleTree,
  Action,
  PhaseState,
} from 'mina-arena-contracts';
import resolveAttack from './attack_resolver.js';
import { Transaction } from 'sequelize';
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
import { GamePieceMeleeAttackAction } from '../../models/game_piece_action.js';

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
  if (distanceToTarget > MELEE_ATTACK_RANGE)
    throw new Error(
      `GamePiece ${attackingGamePiece.id} cannot execute a melee attack against target GamePiece ${targetGamePiece.id} because distance ${distanceToTarget} is greater than melee range of ${MELEE_ATTACK_RANGE}`
    );

  const targetId = await targetGamePiece.gamePieceNumber();

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
  startingPiecesMerkleTree: PiecesMerkleTree,
  startingArenaMerkleTree: ArenaMerkleTree,
  currentPiecesMerkleTree: PiecesMerkleTree,
  currentArenaMerkleTree: ArenaMerkleTree,
  transaction?: Transaction
): Promise<Models.GamePiece> {
  const attackingGamePiece = await action.gamePiece();

  const playerPublicKeyString = (
    await (await attackingGamePiece.gamePlayer()).player()
  ).minaPublicKey;
  const playerPublicKey = PublicKey.fromBase58(playerPublicKeyString);

  const snarkyGameState = new PhaseState({
    nonce: Field(0),
    actionsNonce: Field(action.actionData.nonce - 1), // todo save last-known nonce, don't rely on -1
    startingPiecesState: startingPiecesMerkleTree.tree.getRoot(),
    currentPiecesState: currentPiecesMerkleTree.tree.getRoot(),
    startingArenaState: startingArenaMerkleTree.tree.getRoot(),
    currentArenaState: currentArenaMerkleTree.tree.getRoot(),
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
  const actionParam = Field(actionData.targetGamePieceNumber);
  const snarkyAction = new Action({
    nonce: Field(actionData.nonce),
    actionType: Field(2),
    actionParams: actionParam,
    piece: Field(actionData.gamePieceNumber),
  });

  const attackRolls = actionData.encryptedAttackRolls;

  const resolvedAttack = resolveAttack(
    attackingUnit.meleeNumAttacks,
    attackingUnit.meleeHitRoll,
    attackingUnit.meleeWoundRoll,
    targetUnit.armorSaveRoll,
    attackingUnit.meleeArmorPiercing,
    attackingUnit.meleeDamage,
    attackRolls
  );

  const totalDamageDealt = resolvedAttack.damageDealt;
  const totalDamageAverage = resolvedAttack.averageDamage;

  // Attempt to apply the move action to the game state
  // Warn on console for failure
  const rngPublicKey = PublicKey.fromBase58(process.env.RNG_PUBLIC_KEY);
  try {
    const serverPrivateKey = PrivateKey.fromBase58(
      process.env.SERVER_PRIVATE_KEY
    );
    const roll = new EncrytpedAttackRoll({
      publicKey: Group.fromJSON(attackRolls.publicKey),
      ciphertext: attackRolls.ciphertext.map((c) => Field(c)),
      signature: Signature.fromJSON(attackRolls.signature),
      rngPublicKey,
    });

    const stateAfterAttack = snarkyGameState.applyMeleeAttackAction(
      snarkyAction,
      Signature.fromJSON(action.signature),
      snarkyAttackingPiece,
      snarkyTargetPiece,
      currentPiecesMerkleTree.getWitness(snarkyAttackingPiece.id.toBigInt()),
      currentPiecesMerkleTree.getWitness(snarkyTargetPiece.id.toBigInt()),
      UInt32.from(
        Math.floor(attackingGamePiece.distanceTo(targetGamePiece.coordinates()))
      ),
      roll,
      serverPrivateKey
    );
    // update our passed-in merkle trees with the new state
    if (totalDamageDealt > 0) {
      const newHealth = Math.max(targetGamePiece.health - totalDamageDealt, 0);
      snarkyTargetPiece.condition.health = UInt32.from(newHealth);
      currentPiecesMerkleTree.set(
        snarkyTargetPiece.id.toBigInt(),
        snarkyTargetPiece.hash()
      );
    }
  } catch (e) {
    throw new Error(
      `Unable to apply snarky melee attack action ${JSON.stringify(
        actionData
      )} to game ${attackingGamePiece.gameId} attacking piece ${
        attackingGamePiece.id
      }, target piece ${targetGamePiece.id} - ${e}`
    );
  }

  // Update target GamePiece with damage dealt
  if (totalDamageDealt > 0) {
    const newHealth = Math.max(targetGamePiece.health - totalDamageDealt, 0);
    targetGamePiece.health = newHealth;
    await targetGamePiece.save({ transaction });
  }

  // Update action record as resolved
  let newActionData = JSON.parse(
    JSON.stringify(actionData)
  ) as GamePieceMeleeAttackAction;
  newActionData.resolved = true;
  newActionData.resolvedAttack = resolvedAttack;
  newActionData.totalDamageDealt = totalDamageDealt;
  newActionData.totalDamageAverage = totalDamageAverage;
  action.actionData = newActionData;
  await action.save({ transaction });
}
