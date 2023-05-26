import { DataTypes, Model } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 2;
export const MAX_POINTS = 100;
export const MAX_PIECES = 10;
class Game extends Model {
    async gamePlayers() {
        return await Models.GamePlayer.findAll({ where: { gameId: this.id } });
    }
    async gamePlayersInTurnOrder() {
        if (this.turnPlayerOrder === undefined)
            return [];
        var playerNums = this.turnPlayerOrderArray();
        var gamePlayers = await Models.GamePlayer.findAll({
            where: { gameId: this.id, playerNumber: playerNums }
        });
        // TODO: This is super inefficient, but fine for
        // now since we'll only have two players per game.
        return playerNums.map(function (playerNum) {
            return gamePlayers.find(function (gamePlayer) {
                return gamePlayer.playerNumber == +playerNum;
            });
        });
    }
    async gamePhases() {
        return await Models.GamePhase.findAll({ where: { gameId: this.id } });
    }
    async gamePieces() {
        return await Models.GamePiece.findAll({ where: { gameId: this.id } });
    }
    async currentPhase() {
        return await Models.GamePhase.findOne({
            where: { gameId: this.id },
            order: [['id', 'DESC']]
        });
    }
    // Get the GamePlayer whose turn it is
    async turnGamePlayer() {
        if (this.turnGamePlayerId === undefined)
            return null;
        return await Models.GamePlayer.findByPk(this.turnGamePlayerId);
    }
    // Get the GamePlayer who will be taking the next turn
    async nextGamePlayer() {
        const nextNumber = await this.nextGamePlayerNumber();
        return await Models.GamePlayer.findOne({
            where: {
                gameId: this.id,
                playerNumber: nextNumber
            }
        });
    }
    async winningGamePlayer() {
        if (this.winningGamePlayerId === undefined)
            return null;
        return await Models.GamePlayer.findByPk(this.winningGamePlayerId);
    }
    async gameArena() {
        return await Models.GameArena.findOne({ where: { gameId: this.id } });
    }
    // Get an array of integers representing the order in which players take turns.
    // Each integer element is the playerNumber of the associated GamePlayer.
    turnPlayerOrderArray() {
        return this.turnPlayerOrder.split(',').map(numStr => +numStr);
    }
    // Get the playerNumber of the GamePlayer whose turn it is
    async turnGamePlayerNumber() {
        return (await this.turnGamePlayer()).playerNumber;
    }
    // Get the playerNumber of the GamePlayer who will be taking the next turn
    async nextGamePlayerNumber() {
        const currentPlayerNumber = await this.turnGamePlayerNumber();
        const playerNumberOrder = this.turnPlayerOrderArray();
        const currentPlayerIndex = playerNumberOrder.indexOf(currentPlayerNumber);
        if (currentPlayerIndex == (playerNumberOrder.length - 1)) {
            return playerNumberOrder[0];
        }
        else {
            return playerNumberOrder[currentPlayerIndex + 1];
        }
    }
}
Game.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    status: {
        allowNull: false,
        type: DataTypes.ENUM('pending', 'inProgress', 'completed', 'canceled')
    },
    turnNumber: {
        type: DataTypes.INTEGER
    },
    phase: {
        type: DataTypes.ENUM('movement', 'shooting', 'melee')
    },
    turnPlayerOrder: {
        type: DataTypes.STRING
    },
    turnGamePlayerId: {
        type: DataTypes.INTEGER
    },
    winningGamePlayerId: {
        type: DataTypes.INTEGER
    },
    createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
    },
    updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
    },
}, {
    sequelize: sequelizeConnection
});
export default Game;
//# sourceMappingURL=game.js.map