import * as Models from '../../models/index.js';
import sequelizeConnection from '../../db/config.js';
export default async (parent, args, contextValue, info) => {
    return await sequelizeConnection.transaction(async (t) => {
        // Validate that player exists
        const player = await Models.Player.findOne({
            where: { minaPublicKey: args.input.minaPublicKey },
            transaction: t
        });
        if (!player)
            throw new Error(`Player with minaPublicKey ${args.input.minaPublicKey} not found`);
        let gamePiece = await Models.GamePiece.findByPk(args.input.gamePieceId, { transaction: t });
        if (!gamePiece)
            throw new Error(`GamePiece with ID ${args.input.gamePieceId} not found`);
        const game = await Models.Game.findByPk(gamePiece.gameId, { transaction: t });
        const gamePlayer = await Models.GamePlayer.findOne({
            where: { gameId: game.id, playerId: player.id },
            transaction: t
        });
        if (!gamePlayer)
            throw new Error(`Player ${player.name} is not present in Game ${game.id}`);
        // Validate that game is in correct state and it's this player's turn
        if (game.turnGamePlayerId != gamePlayer.id)
            throw new Error(`It is not your turn!`);
        const gamePhase = await game.currentPhase();
        // Validate that the game is in the correct state to be adding pieces
        if (game.status != 'pending')
            throw new Error(`Game is no longer allowing new GamePieces to be added`);
        // Create GamePieces
        let createdGamePieces = [];
        for (const gamePieceInput of args.input.gamePieces) {
            if (gamePieceInput.playerUnitId) {
                // Client has selected a pre-existing
                // PlayerUnit, create a GamePiece from that.
                createdGamePieces.push(await createGamePieceForPlayerUnit(game, gamePlayer, gamePieceInput.playerUnitId, t));
            }
            else if (gamePieceInput.createPlayerUnit) {
                // Client has indicated they want to create a PlayerUnit
                // from a selected Unit and create a GamePiece from that.
                createdGamePieces.push(await createGamePieceForUnit(game, gamePlayer, gamePieceInput.createPlayerUnit.unitId, gamePieceInput.createPlayerUnit.name, t));
            }
            else {
                throw new Error(`Invalid entry in argument gamePieceInputs, exactly one of [playerUnitId, createPlayerUnit] must be provided.`);
            }
        }
        return createdGamePieces;
    });
};
async function createGamePieceForPlayerUnit(game, gamePlayer, playerUnitId, transaction) {
    let playerUnit = await Models.PlayerUnit.findByPk(playerUnitId, { transaction });
    if (!playerUnit)
        throw new Error(`No PlayerUnit found with ID ${playerUnitId}`);
    let unit = await Models.Unit.findByPk(playerUnit.unitId, { transaction });
    return await Models.GamePiece.create({
        gameId: game.id,
        gamePlayerId: gamePlayer.id,
        playerUnitId: playerUnit.id,
        health: unit.maxHealth
    }, { transaction });
}
async function createGamePieceForUnit(game, gamePlayer, unitId, playerUnitName, transaction) {
    let unit = await Models.Unit.findByPk(unitId, { transaction });
    if (!unit)
        throw new Error(`No Unit found with ID ${unitId}`);
    let playerUnit = await Models.PlayerUnit.create({
        playerId: gamePlayer.playerId,
        unitId: unit.id,
        name: playerUnitName
    }, { transaction });
    return await Models.GamePiece.create({
        gameId: game.id,
        gamePlayerId: gamePlayer.id,
        playerUnitId: playerUnit.id,
        health: unit.maxHealth
    }, { transaction });
}
//# sourceMappingURL=create_game_piece_action.js.map