import * as Models from '../../models/index.js';
import { GamePieceCoordinates } from '../../graphql/__generated__/resolvers-types.js';
import { Transaction } from 'sequelize';

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