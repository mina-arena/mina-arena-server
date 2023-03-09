import * as Models from '../models/index.js';
import resolveGamePieceAction from './game_piece_action_resolver.js';
export default async (gamePhase, transaction) => {
    // Validate that Game is in progress
    const game = await Models.Game.findByPk(gamePhase.gameId, { transaction: transaction });
    if (game.status != 'inProgress')
        throw new Error(`Game ${game.id} is not in progress, status: ${game.status}`);
    // Gather actions and resolve them in order
    const actions = await Models.GamePieceAction.findAll({
        where: { gamePhaseId: gamePhase.id },
        order: [['id', 'ASC']],
        transaction: transaction
    });
    for (const action of actions) {
        await resolveGamePieceAction(action, true, transaction);
    }
    // Check if any player has won
    const checkForWinnerResult = await checkForWinner(game, transaction);
    if (checkForWinnerResult.isGameDone) {
        // Game is over, mark as done
        game.status = 'completed';
        if (checkForWinnerResult.winningGamePlayer) {
            game.winningGamePlayerId = checkForWinnerResult.winningGamePlayer.id;
        }
        await game.save({ transaction: transaction });
    }
    else {
        // Game continues, create the next GamePhase
        const nextPhase = await createNextGamePhase(game, gamePhase, transaction);
        game.phase = nextPhase.phase;
        game.turnNumber = nextPhase.turnNumber;
        game.turnGamePlayerId = nextPhase.gamePlayerId;
        await game.save({ transaction: transaction });
    }
    return game;
};
async function checkForWinner(game, transaction) {
    const gamePlayers = await Models.GamePlayer.findAll({
        where: { gameId: game.id },
        transaction: transaction
    });
    let livingGamePlayers = [];
    for (const gamePlayer of gamePlayers) {
        if (await gamePlayer.areAllGamePiecesDead())
            continue;
        livingGamePlayers.push(gamePlayer);
    }
    if (livingGamePlayers.length > 1)
        return { isGameDone: false };
    if (livingGamePlayers.length == 1) {
        return { isGameDone: true, winningGamePlayer: livingGamePlayers[0] };
    }
    return { isGameDone: true, winningGamePlayer: null };
}
async function createNextGamePhase(game, currentPhase, transaction) {
    let nextTurnNumber;
    let nextPhase;
    let nextGamePlayerId;
    switch (currentPhase.phase) {
        case 'movement':
            nextTurnNumber = currentPhase.turnNumber;
            nextPhase = 'shooting';
            nextGamePlayerId = currentPhase.gamePlayerId;
            break;
        case 'shooting':
            nextTurnNumber = currentPhase.turnNumber;
            nextPhase = 'melee';
            nextGamePlayerId = currentPhase.gamePlayerId;
            break;
        case 'melee':
            // Only increment the turn number when the first player is going again
            const nextGamePlayerNumber = await game.nextGamePlayerNumber();
            const firstPlayerNumber = game.turnPlayerOrderArray()[0];
            const isNewRound = nextGamePlayerNumber == firstPlayerNumber;
            nextTurnNumber = isNewRound ? currentPhase.turnNumber + 1 : currentPhase.turnNumber;
            nextPhase = 'movement';
            nextGamePlayerId = (await game.nextGamePlayer()).id;
            break;
    }
    return await Models.GamePhase.create({
        gameId: game.id,
        gamePlayerId: nextGamePlayerId,
        turnNumber: nextTurnNumber,
        phase: nextPhase
    }, { transaction: transaction });
}
//# sourceMappingURL=game_phase_resolver.js.map