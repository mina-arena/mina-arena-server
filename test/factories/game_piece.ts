import * as Models from '../../src/models';

export default async function createGamePiece(
  gamePlayer: Models.GamePlayer,
  playerUnit: Models.PlayerUnit,
  positionX: number,
  positionY: number
): Promise<Models.GamePiece> {
  return await Models.GamePiece.create({
    gameId: gamePlayer.gameId,
    gamePlayerId: gamePlayer.id,
    playerUnitId: playerUnit.id,
    positionX,
    positionY,
    health: (await playerUnit.unit()).maxHealth
  });
}