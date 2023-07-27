import * as Models from '../../models/index.js';
import { GamePieceCoordinates } from '../../graphql/__generated__/resolvers-types.js';
import { Transaction } from 'sequelize';
import {
  Action,
  ArenaMerkleTree,
  PhaseState,
  PiecesMerkleTree,
  Position,
} from 'mina-arena-contracts';
import { Field, PublicKey, UInt32, Signature } from 'snarkyjs';

export type ValidateMoveActionResult = {
  distance: number;
};

export async function validateMoveAction(
  gamePiece: Models.GamePiece,
  moveFrom: GamePieceCoordinates,
  moveTo: GamePieceCoordinates,
  transaction?: Transaction
): Promise<ValidateMoveActionResult> {
  const currentPos = gamePiece.coordinates();

  if (moveFrom.x != currentPos.x || moveFrom.y != currentPos.y) {
    throw new Error(
      `GamePiece ${gamePiece.id} is at ${JSON.stringify(currentPos)} ` +
        `but you are attempting to move it from ${JSON.stringify(moveFrom)}`
    );
  }

  const moveValidityResult = await gamePiece.checkMoveValidity(moveTo);
  if (!moveValidityResult.valid) {
    if (moveValidityResult.invalidReason == 'beyondMaxRange') {
      throw new Error(
        `GamePiece ${gamePiece.id} cannot be moved from ${JSON.stringify(
          currentPos
        )} to ${JSON.stringify(moveTo)} ` +
          `because the distance is ${moveValidityResult.distance} its movement speed is ${moveValidityResult.movementSpeed}`
      );
    }
    if (moveValidityResult.invalidReason == 'collidesWithOtherPiece') {
      throw new Error(
        `GamePiece ${gamePiece.id} cannot be moved from ${JSON.stringify(
          currentPos
        )} ` +
          `to ${JSON.stringify(
            moveTo
          )} because this collides with another GamePiece`
      );
    }
  }

  return {
    distance: moveValidityResult.distance,
  };
}

export default async function resolveMoveAction(
  action: Models.GamePieceAction,
  startingPiecesMerkleTree: PiecesMerkleTree,
  startingArenaMerkleTree: ArenaMerkleTree,
  currentPiecesMerkleTree: PiecesMerkleTree,
  currentArenaMerkleTree: ArenaMerkleTree,
  transaction?: Transaction
): Promise<Models.GamePiece> {
  const gamePiece = await action.gamePiece();

  const playerPublicKeyString = (await (await gamePiece.gamePlayer()).player())
    .minaPublicKey;
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
  if (actionData.actionType !== 'move')
    throw new Error(
      `Unable to resolve move action with actionType ${actionData.actionType}`
    );

  const moveValidity = await validateMoveAction(
    gamePiece,
    actionData.moveFrom,
    actionData.moveTo,
    transaction
  );

  const actionParam = Position.fromXY(actionData.moveTo.x, actionData.moveTo.y);
  const snarkyPiece = await gamePiece.toSnarkyPiece();
  const snarkyAction = new Action({
    nonce: Field(actionData.nonce),
    actionType: Field(0),
    actionParams: actionParam.hash(),
    piece: Field(actionData.gamePieceNumber),
  });

  // Attempt to apply the move action to the game state
  // Warn on console for failure
  let stateAfterMove: PhaseState;
  try {
    const arenaTreeAfterMove = currentArenaMerkleTree.clone();
    arenaTreeAfterMove.set(gamePiece.positionX, gamePiece.positionY, Field(0));

    stateAfterMove = snarkyGameState.applyMoveAction(
      snarkyAction,
      Signature.fromJSON(action.signature),
      snarkyPiece,
      currentPiecesMerkleTree.getWitness(snarkyPiece.id.toBigInt()),
      currentArenaMerkleTree.getWitness(
        gamePiece.positionX,
        gamePiece.positionY
      ),
      arenaTreeAfterMove.getWitness(actionData.moveTo.x, actionData.moveTo.y),
      actionParam,
      UInt32.from(Math.floor(moveValidity.distance)) // we need the true distance here
    );
    // update our passed-in merkle trees with the new state
    snarkyPiece.position = actionParam;
    currentPiecesMerkleTree.set(snarkyPiece.id.toBigInt(), snarkyPiece.hash());
    currentArenaMerkleTree.set(
      actionData.moveTo.x,
      actionData.moveTo.y,
      Field(1)
    );
    currentArenaMerkleTree.set(
      gamePiece.positionX,
      gamePiece.positionY,
      Field(0)
    );
  } catch (e) {
    throw new Error(
      `Unable to apply snarky move action ${JSON.stringify(
        actionData
      )} to game ${gamePiece.gameId} piece ${gamePiece.id} - ${e}`
    );
  }

  // Validations done, modify state
  gamePiece.positionX = actionData.moveTo.x;
  gamePiece.positionY = actionData.moveTo.y;
  await gamePiece.save({ transaction });

  // Update action record as resolved
  let newActionData = JSON.parse(JSON.stringify(actionData));
  newActionData.resolved = true;
  action.actionData = newActionData;
  await action.save({ transaction });

  return gamePiece;
}
