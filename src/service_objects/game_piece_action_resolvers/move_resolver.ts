import * as Models from '../../models/index.js';
import { GamePieceCoordinates } from '../../graphql/__generated__/resolvers-types.js';
import { Transaction } from 'sequelize';
import serializePiecesTree from '../mina/pieces_tree_serializer.js';
import serializeArenaTree from '../mina/arena_tree_serializer.js';
import { Action, PhaseState, Position } from 'mina-arena-contracts';
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
  transaction?: Transaction
): Promise<Models.GamePiece> {
  const gamePiece = await action.gamePiece();

  const playerPublicKeyString = (await (await gamePiece.gamePlayer()).player())
    .minaPublicKey;
  const playerPublicKey = PublicKey.fromBase58(playerPublicKeyString);

  const startingGamePiecesTree = await serializePiecesTree(gamePiece.gameId);
  const startingGameArenaTree = await serializeArenaTree(gamePiece.gameId);

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
  const snarkyAction = new Action(
    Field(1),
    Field(0),
    actionParam.hash(),
    snarkyPiece.id
  );

  // Attempt to apply the move action to the game state
  // Warn on console for failure
  let snarkySuccess = false;
  let stateAfterMove: PhaseState;
  try {
    const arenaTreeAfterMove = startingGameArenaTree.clone();
    arenaTreeAfterMove.set(gamePiece.positionX, gamePiece.positionY, Field(0));

    stateAfterMove = snarkyGameState.applyMoveAction(
      snarkyAction,
      Signature.fromJSON(action.signature),
      snarkyPiece,
      startingGamePiecesTree.getWitness(snarkyPiece.id.toBigInt()),
      startingGameArenaTree.getWitness(
        gamePiece.positionX,
        gamePiece.positionY
      ),
      arenaTreeAfterMove.getWitness(actionData.moveTo.x, actionData.moveTo.y),
      actionParam,
      UInt32.from(Math.floor(moveValidity.distance)) // we need the true distance here
    );
    snarkySuccess = true;
    console.log(
      `Successfully applied snarky move action ${JSON.stringify(
        actionData
      )} to game ${gamePiece.gameId} piece ${gamePiece.id}`
    );
  } catch (e) {
    console.warn(
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

  // Warn on console if the state does not match
  if (snarkySuccess) {
    const endingGamePiecesTree = await serializePiecesTree(gamePiece.gameId);
    const endingGameArenaTree = await serializeArenaTree(gamePiece.gameId);
    const snarkyGameStateAfter = new PhaseState({
      nonce: Field(0),
      actionsNonce: Field(1),
      startingPiecesState: startingGamePiecesTree.tree.getRoot(),
      currentPiecesState: endingGamePiecesTree.tree.getRoot(),
      startingArenaState: startingGameArenaTree.tree.getRoot(),
      currentArenaState: endingGameArenaTree.tree.getRoot(),
      playerPublicKey,
    })
      .hash()
      .toString();

    if (snarkyGameStateAfter != stateAfterMove.hash().toString()) {
      console.warn(
        `Snarky game state after move action does not match expected state! (${snarkyGameStateAfter} != ${stateAfterMove
          .hash()
          .toString()})`
      );
    } else {
      console.log(
        `Snarky game state after move action matches expected state!`
      );
    }
  }

  return gamePiece;
}
