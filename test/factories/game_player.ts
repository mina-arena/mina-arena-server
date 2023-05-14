import * as Models from '../../src/models';

export default async function createGamePlayer(
  game: Models.Game,
  player: Models.Player
): Promise<Models.GamePlayer> {
  let existingGamePlayers = await game.gamePlayers();

  // Make this the next GamePlayer in the game
  let playerNum = 1;
  existingGamePlayers.forEach(gamePlayer => {
    if (gamePlayer.playerNumber >= playerNum) playerNum = gamePlayer.playerNumber + 1;
  });

  return await Models.GamePlayer.create({
    gameId: game.id,
    playerId: player.id,
    playerNumber: playerNum
  });
}