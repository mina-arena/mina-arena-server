import * as Models from '../models/index.js';
import sequelizeConnection from '../db/config.js';
import resolveGamePieceAction from './game_piece_action_resolver.js';
import { GamePhaseName, GAME_PHASE_ORDER } from '../models/game_phase.js';
import { Transaction } from 'sequelize';
import { serializeArenaTreeFromGameId } from './mina/arena_tree_serializer.js';
import { serializePiecesTreeFromGameId } from './mina/pieces_tree_serializer.js';

export default async (
  gamePhase: Models.GamePhase,
  transaction?: Transaction
): Promise<Models.Game> => {
  // Validate that Game is in progress
  const game = await Models.Game.findByPk(gamePhase.gameId, { transaction });
  if (game.status != 'inProgress')
    throw new Error(
      `Game ${game.id} is not in progress, status: ${game.status}`
    );

  // Gather actions and resolve them in order
  const actions = await Models.GamePieceAction.findAll({
    where: { gamePhaseId: gamePhase.id },
    order: [['id', 'ASC']],
    transaction,
  });
  const startingPiecesMerleTree = await serializePiecesTreeFromGameId(
    game.id,
    transaction
  );
  const startingArenaMerkleTree = await serializeArenaTreeFromGameId(
    game.id,
    transaction
  );
  const currentPiecesMerkleTree = startingPiecesMerleTree.clone();
  const currentArenaMerkleTree = startingArenaMerkleTree.clone();
  for (const action of actions) {
    await resolveGamePieceAction(
      action,
      startingPiecesMerleTree,
      startingArenaMerkleTree,
      currentPiecesMerkleTree,
      currentArenaMerkleTree,
      transaction
    );
  }

  // Check if any player has won
  const checkForWinnerResult = await checkForWinner(game, transaction);
  if (checkForWinnerResult.isGameDone) {
    // Game is over, mark as done
    game.status = 'completed';
    if (checkForWinnerResult.winningGamePlayer) {
      game.winningGamePlayerId = checkForWinnerResult.winningGamePlayer.id;
    }
    await game.save({ transaction });
  } else {
    // Game continues, create the next GamePhase
    const nextPhase = await createNextGamePhase(game, gamePhase, transaction);
    game.phase = nextPhase.phase;
    game.turnNumber = nextPhase.turnNumber;
    game.turnGamePlayerId = nextPhase.gamePlayerId;
    await game.save({ transaction });
  }

  return game;
};

type CheckForWinnerResult = {
  isGameDone: boolean;
  winningGamePlayer?: Models.GamePlayer;
};

async function checkForWinner(
  game: Models.Game,
  transaction?: Transaction
): Promise<CheckForWinnerResult> {
  const gamePlayers = await Models.GamePlayer.findAll({
    where: { gameId: game.id },
    transaction,
  });

  let livingGamePlayers = [];
  for (const gamePlayer of gamePlayers) {
    if (await gamePlayer.areAllGamePiecesDead()) continue;

    livingGamePlayers.push(gamePlayer);
  }

  if (livingGamePlayers.length > 1) return { isGameDone: false };

  if (livingGamePlayers.length == 1) {
    return { isGameDone: true, winningGamePlayer: livingGamePlayers[0] };
  }

  return { isGameDone: true, winningGamePlayer: null };
}

async function createNextGamePhase(
  game: Models.Game,
  currentPhase: Models.GamePhase,
  transaction?: Transaction
): Promise<Models.GamePhase> {
  let nextTurnNumber: number;
  let nextPhase: GamePhaseName;
  let nextGamePlayerId: number;

  const currentPhaseIndex = GAME_PHASE_ORDER.indexOf(currentPhase.phase);
  const endOfCurrentPlayerTurn =
    currentPhaseIndex == GAME_PHASE_ORDER.length - 1;

  if (endOfCurrentPlayerTurn) {
    // Only increment the turn number when the first player is going again
    const nextGamePlayerNumber = await game.nextGamePlayerNumber();
    const firstPlayerNumber = game.turnPlayerOrderArray()[0];
    const isNewRound = nextGamePlayerNumber == firstPlayerNumber;
    nextTurnNumber = isNewRound
      ? currentPhase.turnNumber + 1
      : currentPhase.turnNumber;
    nextPhase = GAME_PHASE_ORDER[0];
    nextGamePlayerId = (await game.nextGamePlayer()).id;
  } else {
    nextTurnNumber = currentPhase.turnNumber;
    nextPhase = GAME_PHASE_ORDER[currentPhaseIndex + 1];
    nextGamePlayerId = currentPhase.gamePlayerId;
  }

  return await Models.GamePhase.create(
    {
      gameId: game.id,
      gamePlayerId: nextGamePlayerId,
      turnNumber: nextTurnNumber,
      phase: nextPhase,
    },
    { transaction }
  );
}
