import * as Types from '../__generated__/resolvers-types';
import * as Models from '../../models/index.js';
import sequelizeConnection from '../../db/config.js';
import { PhaseState } from 'mina-arena-contracts';
import { serializePiecesTreeFromPieces } from '../../service_objects/mina/pieces_tree_serializer.js';
import { serializeArenaTreeFromPieces } from '../../service_objects/mina/arena_tree_serializer.js';
import newrelic from 'newrelic';

export default async (
  parent,
  args: { input: Types.SubmitGamePhaseInput },
  contextValue,
  info
): Promise<Models.Game> => {
  return await sequelizeConnection.transaction(async (t) => {
    // Validate that player exists
    const player = await Models.Player.findOne({
      where: { minaPublicKey: args.input.minaPublicKey },
      transaction: t,
    });
    if (!player) throw new Error(`Player not found with provided public key`);

    // Validate that GamePhase exists and it's this player's turn
    const gamePhase = await Models.GamePhase.findByPk(args.input.gamePhaseId, {
      transaction: t,
    });
    if (!gamePhase)
      throw new Error(`GamePhase ${args.input.gamePhaseId} not found`);

    const gamePlayer = await Models.GamePlayer.findByPk(
      gamePhase.gamePlayerId,
      { transaction: t }
    );
    if (gamePlayer.playerId != player.id)
      throw new Error(`It is not your turn!`);

    // Validate that the GamePhase being submitted is the Game's current phase
    const game = await Models.Game.findByPk(gamePhase.gameId, {
      transaction: t,
    });
    const currentPhase = await game.currentPhase();
    if (gamePhase.id != currentPhase.id)
      throw new Error(
        `GamePhase ${gamePhase.id} cannot be submitted because it is not the current phase for Game ${game.id}`
      );

    let gamePieces = await Models.GamePiece.findAll({
      where: { gameId: game.id },
      transaction: t,
    });
    const startingPiecesMerkleTree = (
      await serializePiecesTreeFromPieces(gamePieces)
    ).tree
      .getRoot()
      .toString();
    const startingArenaMerkleTree = (
      await serializeArenaTreeFromPieces(gamePieces)
    ).tree
      .getRoot()
      .toString();
    let initialPhaseState = PhaseState.fromJSON({
      nonce: '0',
      actionsNonce: '0',
      startingPiecesState: startingPiecesMerkleTree,
      currentPiecesState: startingPiecesMerkleTree,
      startingArenaState: startingArenaMerkleTree,
      currentArenaState: startingArenaMerkleTree,
      playerPublicKey: player.minaPublicKey,
    });
    gamePhase.initialPhaseState = JSON.stringify(
      PhaseState.toJSON(initialPhaseState)
    );

    // Resolve the GamePhase and return the Game
    const ret = await gamePhase.resolve(t);

    let gamePieceActions = await Models.GamePieceAction.findAll({
      where: { gamePhaseId: gamePhase.id },
      transaction: t,
    });
    gamePieces = await Models.GamePiece.findAll({
      where: { gameId: game.id },
      transaction: t,
    });
    const finalPiecesMerkleTree = (
      await serializePiecesTreeFromPieces(gamePieces)
    ).tree
      .getRoot()
      .toString();
    const finalArenaMerkleTree = (
      await serializeArenaTreeFromPieces(gamePieces)
    ).tree
      .getRoot()
      .toString();
    const actionsNonce = String(gamePieceActions.length);
    initialPhaseState = PhaseState.fromJSON({
      nonce: '0',
      actionsNonce: actionsNonce,
      startingPiecesState: startingPiecesMerkleTree,
      currentPiecesState: finalPiecesMerkleTree,
      startingArenaState: startingArenaMerkleTree,
      currentArenaState: finalArenaMerkleTree,
      playerPublicKey: player.minaPublicKey,
    });
    gamePhase.finalPhaseState = JSON.stringify(
      PhaseState.toJSON(initialPhaseState)
    );

    gamePhase.save(t);

    newrelic.recordCustomEvent('ResolveGamePhase', {
      player: player.minaPublicKey,
      gameId: game.id,
      phaseName: gamePhase.phase,
    });
    return ret;
  });
};
