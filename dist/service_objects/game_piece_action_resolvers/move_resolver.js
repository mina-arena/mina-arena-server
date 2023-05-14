export default async function resolveMoveAction(gamePiece, moveFrom, moveTo, commitChanges = false, transaction) {
    const currentPos = gamePiece.coordinates();
    if (moveFrom.x != currentPos.x || moveFrom.y != currentPos.y) {
        throw new Error(`GamePiece ${gamePiece.id} is at ${JSON.stringify(currentPos)} ` +
            `but you are attempting to move it from ${JSON.stringify(moveFrom)}`);
    }
    const moveValidityResult = await gamePiece.checkMoveValidity(moveTo);
    if (!moveValidityResult.valid) {
        if (moveValidityResult.invalidReason == 'beyondMaxRange') {
            throw new Error(`GamePiece ${gamePiece.id} cannot be moved from ${JSON.stringify(currentPos)} to ${JSON.stringify(moveTo)} ` +
                `because the distance is ${moveValidityResult.distance} its movement speed is ${moveValidityResult.movementSpeed}`);
        }
        if (moveValidityResult.invalidReason == 'collidesWithOtherPiece') {
            throw new Error(`GamePiece ${gamePiece.id} cannot be moved from ${JSON.stringify(currentPos)} ` +
                `to ${JSON.stringify(moveTo)} because this collides with another GamePiece`);
        }
    }
    if (commitChanges) {
        // Validations done, modify state
        gamePiece.positionX = moveTo.x;
        gamePiece.positionY = moveTo.y;
        await gamePiece.save({ transaction: transaction });
    }
    return gamePiece;
}
//# sourceMappingURL=move_resolver.js.map