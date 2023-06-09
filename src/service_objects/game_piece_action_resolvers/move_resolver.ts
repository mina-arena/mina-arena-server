import * as Models from '../../models/index.js';
import { GamePieceCoordinates } from '../../graphql/__generated__/resolvers-types.js';
import { Transaction } from 'sequelize';
import serializePiecesTree from '../mina/pieces_tree_serializer.js';
import serializeArenaTree from '../mina/arena_tree_serializer.js';
import { PhaseState } from 'mina-arena-contracts';
import { Field, PublicKey } from 'snarkyjs';

export type ValidateMoveActionResult = {
  distance: number
}

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
        `GamePiece ${gamePiece.id} cannot be moved from ${JSON.stringify(currentPos)} to ${JSON.stringify(moveTo)} ` +
        `because the distance is ${moveValidityResult.distance} its movement speed is ${moveValidityResult.movementSpeed}`
      );
    }
    if (moveValidityResult.invalidReason == 'collidesWithOtherPiece') {
      throw new Error(
        `GamePiece ${gamePiece.id} cannot be moved from ${JSON.stringify(currentPos)} ` +
        `to ${JSON.stringify(moveTo)} because this collides with another GamePiece`
      );
    }
  }

  return {
    distance: moveValidityResult.distance
  };
}

export default async function resolveMoveAction(
  action: Models.GamePieceAction,
  transaction?: Transaction
): Promise<Models.GamePiece> {
  const gamePiece = await action.gamePiece();
  const playerPublicKey = (await (await gamePiece.gamePlayer()).player()).minaPublicKey;

  const startingGamePiecesTree = await serializePiecesTree(gamePiece.gameId);
  const startingGameArenaTree = await serializeArenaTree(gamePiece.gameId);

  const snarkyGameState = new PhaseState(
    Field(0),
    Field(0),
    startingGamePiecesTree.tree.getRoot(),
    startingGamePiecesTree.tree.getRoot(),
    startingGameArenaTree.tree.getRoot(),
    startingGameArenaTree.tree.getRoot(),
    PublicKey.fromBase58(playerPublicKey)
  )

  const actionData = action.actionData;
  if (actionData.actionType !== 'move') throw new Error(`Unable to resolve move action with actionType ${actionData.actionType}`);

  await validateMoveAction(gamePiece, actionData.moveFrom, actionData.moveTo, transaction);

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