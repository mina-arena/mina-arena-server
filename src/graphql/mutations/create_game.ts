import * as Types from '../__generated__/resolvers-types';
import * as Models from '../../models/index.js';
import sequelizeConnection from '../../db/config.js';
import { shuffle, unique } from '../helpers.js';
import newrelic from 'newrelic';

export default async (
  parent,
  args: { input: Types.CreateGameInput },
  contextValue,
  info
): Promise<Models.Game> => {
  return await sequelizeConnection.transaction(async (t) => {
    // Randomize player turn order
    let playerOrder = shuffle(
      args.input.players.map((player) => player.playerNumber)
    );
    if (unique(playerOrder).length != playerOrder.length) {
      throw new Error(`Invalid player numbers provided: ${playerOrder}`);
    }

    // Create the Game
    let game = await Models.Game.create(
      {
        status: 'pending',
        turnPlayerOrder: playerOrder.join(','),
      },
      { transaction: t }
    );

    // Create the GameArena
    await Models.GameArena.create(
      {
        gameId: game.id,
        width: args.input.arenaWidth,
        height: args.input.arenaHeight,
      },
      { transaction: t }
    );

    // Upsert Players and associate them with the Game
    for (const playerInput of args.input.players) {
      const [player, created] = await Models.Player.findOrCreate({
        where: { minaPublicKey: playerInput.minaPublicKey },
        defaults: { name: playerInput.name },
        transaction: t,
      });

      await Models.GamePlayer.create(
        {
          gameId: game.id,
          playerId: player.id,
          playerNumber: playerInput.playerNumber,
        },
        { transaction: t }
      );
    }

    newrelic.recordCustomEvent('CreateGame', {
      id: game.id,
      player1: args.input.players[0].minaPublicKey,
      player2: args.input.players[1].minaPublicKey,
    });

    return game;
  });
};
