import * as Types from '../__generated__/resolvers-types';
import * as Models from '../../models/index.js';
import sequelizeConnection from '../../db/config.js';

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
      transaction: t
    });
    if (!player) throw new Error(`Player not found with provided public key`);

    // Validate that GamePhase exists and it's this player's turn
    const gamePhase = await Models.GamePhase.findByPk(args.input.gamePhaseId, { transaction: t });
    if (!gamePhase) throw new Error(`GamePhase ${args.input.gamePhaseId} not found`);
    
    const gamePlayer = await Models.GamePlayer.findByPk(gamePhase.gamePlayerId, { transaction: t });
    if (gamePlayer.playerId != player.id) throw new Error(`It is not your turn!`);

    // Validate that the GamePhase being submitted is the Game's current phase
    const game = await Models.Game.findByPk(gamePhase.gameId, { transaction: t });
    const currentPhase = await game.currentPhase();
    if (gamePhase.id != currentPhase.id) throw new Error(`GamePhase ${gamePhase.id} cannot be submitted because it is not the current phase for Game ${game.id}`);

    // Resolve the GamePhase and return the Game
    return await gamePhase.resolve(t);
  });
}
