import * as Types from '../__generated__/resolvers-types';
import * as Models from '../../models/index.js';
import sequelizeConnection from '../../db/config.js';
import { shuffle, unique } from '../helpers.js';

import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  MAX_POINTS,
  MAX_PIECES,
} from '../../models/game.js';

export default async (
  parent,
  args: { input: Types.StartGameInput },
  contextValue,
  info
): Promise<Models.Game> => {
  return await sequelizeConnection.transaction(async (t) => {
    // Validate that game exists
    let game = await Models.Game.findByPk(args.input.gameId, {
      transaction: t,
    });
    if (!game) throw new Error(`No Game found with ID ${args.input.gameId}`);

    // Validate game state, raises exception if invalid
    const validationResult = await validateGame(game, t);

    // Game is valid, perform setup
    return setupGame(game, validationResult.gamePlayers, t);
  });
};

type ValidateGameResult = {
  game: Models.Game;
  gamePlayers: Models.GamePlayer[];
};

async function validateGame(game: Models.Game, t): Promise<ValidateGameResult> {
  // Validate that game is in correct state to begin
  if (game.status != 'pending')
    throw new Error(
      `Game ${game.id} cannot be started, is in status ${game.status}`
    );

  let gamePlayers = await Models.GamePlayer.findAll({
    where: { gameId: game.id },
    transaction: t,
  });
  if (gamePlayers.length < MIN_PLAYERS || gamePlayers.length > MAX_PLAYERS) {
    throw new Error(
      `Invalid number of GamePlayers to start Game (${gamePlayers.length}), ` +
        `must be between ${MIN_PLAYERS} and ${MAX_PLAYERS}`
    );
  }

  // Validate each player's pieces
  for (const gamePlayer of gamePlayers) {
    let pieces = await Models.GamePiece.findAll({
      where: { gamePlayerId: gamePlayer.id },
      transaction: t,
    });

    // Validate number of pieces
    if (pieces.length < 1 || pieces.length > MAX_PIECES) {
      throw new Error(
        `Invalid number of GamePieces selected for player ${gamePlayer.player.name} ` +
          `(${pieces.length}), must be between 1 and ${MAX_PIECES}`
      );
    }

    // Validate selected PlayerUnits
    let playerUnits = await Models.PlayerUnit.findAll({
      where: { id: pieces.map((piece) => piece.playerUnitId) },
      transaction: t,
    });
    if (pieces.length != playerUnits.length) {
      throw new Error(
        `One or more selected GamePieces for player ${gamePlayer.player.name} do not have associated PlayerUnits`
      );
    }
    let playerUnitIds = playerUnits.map((pu) => pu.id);
    if (unique(playerUnitIds).length != playerUnitIds.length) {
      throw new Error(
        `Detected one or more PlayerUnits selected multiple times for player ${gamePlayer.player.name}`
      );
    }

    // Validate Units
    let units = await Models.Unit.findAll({
      where: { id: playerUnits.map((pu) => pu.unitId) },
      transaction: t,
    });
    let totalPoints = 0;
    for (const playerUnit of playerUnits) {
      let unit = units.find((unit) => unit.id == playerUnit.unitId);
      if (!unit)
        throw new Error(
          `PlayerUnit ${playerUnit.id} for player ${gamePlayer.player.name} references a non-existent Unit`
        );

      totalPoints += unit.pointsCost;
      if (totalPoints > MAX_POINTS) {
        throw new Error(
          `Player ${gamePlayer.player.name} has a points total of ` +
            `${totalPoints} which exceeds the maximum of ${MAX_POINTS}`
        );
      }
    }
  }

  return { game, gamePlayers };
}

async function setupGame(
  game: Models.Game,
  gamePlayers: Models.GamePlayer[],
  t
): Promise<Models.Game> {
  // Identify the player with the first turn and create the first phase
  const turnPlayerNumber = game.turnPlayerOrderArray()[0];
  const turnPlayer = gamePlayers.find(function (gamePlayer) {
    return gamePlayer.playerNumber == turnPlayerNumber;
  });
  await Models.GamePhase.create(
    {
      gameId: game.id,
      gamePlayerId: turnPlayer.id,
      turnNumber: 1,
      phase: 'movement',
    },
    { transaction: t }
  );

  // Position the pieces on the board
  const arena = await Models.GameArena.findOne({
    where: { gameId: game.id },
    transaction: t,
  });

  // TODO: This currently uses dumb unit placement logic
  // and will only work for two players. Implement user-provided deployment!
  const gamePlayerOne = gamePlayers[0];
  const gamePlayerTwo = gamePlayers[1];

  const playerOnePieces = await Models.GamePiece.findAll({
    where: { gamePlayerId: gamePlayerOne.id },
    transaction: t,
  });
  const playerTwoPieces = await Models.GamePiece.findAll({
    where: { gamePlayerId: gamePlayerTwo.id },
    transaction: t,
  });

  const arenaCenterX = arena.width / 2;
  const arenaCenterY = arena.height / 2;
  const pieceXSpacing = 40;

  let playerOnePiecePosX =
    arenaCenterX - pieceXSpacing * (playerOnePieces.length / 2);
  let playerOnePiecePosY = 130;
  let playerTwoPiecePosX =
    arenaCenterX - pieceXSpacing * (playerTwoPieces.length / 2);
  let playerTwoPiecePosY = 410;

  for (let piece of playerOnePieces) {
    piece.positionX = playerOnePiecePosX;
    piece.positionY = playerOnePiecePosY;
    await piece.save({ transaction: t });

    playerOnePiecePosX += pieceXSpacing;
  }

  for (let piece of playerTwoPieces) {
    piece.positionX = playerTwoPiecePosX;
    piece.positionY = playerTwoPiecePosY;
    await piece.save({ transaction: t });

    playerTwoPiecePosX += pieceXSpacing;
  }

  // Update the game to indicate it's now in progress
  game.turnNumber = 1;
  game.phase = 'movement';
  game.turnGamePlayerId = turnPlayer.id;
  game.status = 'inProgress';
  await game.save({ transaction: t });
  return game;
}
