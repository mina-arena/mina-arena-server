import * as Types from '../__generated__/resolvers-types';
import * as Models from '../../models/index.js';
import sequelizeConnection from '../../db/config.js';
import { unique } from '../helpers.js';

export default async (
  parent,
  args: { input: Types.CreateGamePiecesInput },
  contextValue,
  info
): Promise<Models.GamePiece[]> => {
  return await sequelizeConnection.transaction(async (t) => {
    // Validate that player exists
    const player = await Models.Player.findOne({
      where: { minaPublicKey: args.input.minaPublicKey },
      transaction: t
    });
    if (!player) throw new Error(`Player with minaPublicKey ${args.input.minaPublicKey} not found`);

    // Validate that game exists
    const game = await Models.Game.findByPk(args.input.gameId, { transaction: t });
    if (!game) throw new Error(`Game with ID ${args.input.gameId} not found`);

    // Validate that player is part of indicated game
    const gamePlayer = await Models.GamePlayer.findOne({
      where: { gameId: game.id, playerId: player.id },
      transaction: t
    });
    if (!gamePlayer) throw new Error(`Player ${player.name} is not present in Game ${game.id}`);

    // Validate that the game is in the correct state to be adding pieces
    if (game.status != 'pending') throw new Error(`Game is no longer allowing new GamePieces to be added`);

    // Create GamePieces
    let createdGamePieces = [];
    for (const gamePieceInput of args.input.gamePieces) {
      if (gamePieceInput.playerUnitId) {
        // Client has selected a pre-existing
        // PlayerUnit, create a GamePiece from that.
        createdGamePieces.push(
          await createGamePieceForPlayerUnit(
            game,
            gamePlayer,
            gamePieceInput.playerUnitId,
            t
          )
        );
      } else if (gamePieceInput.createPlayerUnit) {
        // Client has indicated they want to create a PlayerUnit
        // from a selected Unit and create a GamePiece from that.
        createdGamePieces.push(
          await createGamePieceForUnit(
            game,
            gamePlayer,
            gamePieceInput.createPlayerUnit.unitId,
            gamePieceInput.createPlayerUnit.name,
            t
          )
        );
      } else {
        throw new Error(`Invalid entry in argument gamePieceInputs, exactly one of [playerUnitId, createPlayerUnit] must be provided.`);
      }
    }

    return createdGamePieces;
  });
}

async function createGamePieceForPlayerUnit(
  game: Models.Game,
  gamePlayer: Models.GamePlayer,
  playerUnitId: string,
  transaction
): Promise<Models.GamePiece> {
  let playerUnit = await Models.PlayerUnit.findByPk(playerUnitId, { transaction: transaction });
  if (!playerUnit) throw new Error(`No PlayerUnit found with ID ${playerUnitId}`);

  let unit = await Models.Unit.findByPk(playerUnit.unitId, { transaction: transaction });
  return await Models.GamePiece.create(
    {
      gameId: game.id,
      gamePlayerId: gamePlayer.id,
      playerUnitId: playerUnit.id,
      health: unit.maxHealth
    },
    { transaction: transaction }
  );
}

async function createGamePieceForUnit(
  game: Models.Game,
  gamePlayer: Models.GamePlayer,
  unitId: string | number,
  playerUnitName: string,
  transaction
): Promise<Models.GamePiece> {
  let unit = await Models.Unit.findByPk(unitId, { transaction: transaction });
  if (!unit) throw new Error(`No Unit found with ID ${unitId}`);

  let playerUnit = await Models.PlayerUnit.create(
    {
      playerId: gamePlayer.playerId,
      unitId: unit.id,
      name: playerUnitName
    },
    { transaction: transaction }
  );

  return await Models.GamePiece.create(
    {
      gameId: game.id,
      gamePlayerId: gamePlayer.id,
      playerUnitId: playerUnit.id,
      health: unit.maxHealth
    },
    { transaction: transaction }
  );
}