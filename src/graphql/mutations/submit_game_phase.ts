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

    // Resolve the GamePhase and return the Game
    return await gamePhase.resolve(t);
  });
}
