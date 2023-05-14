import { DataTypes, Model } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';
import { Op } from 'sequelize';
class GamePlayer extends Model {
    async game() {
        return await Models.Game.findByPk(this.gameId);
    }
    async player() {
        return await Models.Player.findByPk(this.playerId);
    }
    async areAllGamePiecesDead() {
        const numLivingGamePieces = await Models.GamePiece.count({
            where: {
                gamePlayerId: this.id,
                health: { [Op.gt]: 0 }
            }
        });
        return numLivingGamePieces <= 0;
    }
}
GamePlayer.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    gameId: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    playerId: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    playerNumber: {
        allowNull: false,
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
export default GamePlayer;
//# sourceMappingURL=game_player.js.map