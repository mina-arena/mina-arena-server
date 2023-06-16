import { DataTypes, Model, } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';
const ACTION_TYPES = ['move', 'rangedAttack', 'meleeAttack'];
class GamePieceAction extends Model {
    async gamePhase() {
        return await Models.GamePhase.findByPk(this.gamePhaseId);
    }
    async gamePlayer() {
        return await Models.GamePlayer.findByPk(this.gamePlayerId);
    }
    async gamePiece() {
        return await Models.GamePiece.findByPk(this.gamePieceId);
    }
}
GamePieceAction.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    gamePhaseId: {
        allowNull: false,
        type: DataTypes.INTEGER,
    },
    gamePlayerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
    },
    gamePieceId: {
        allowNull: false,
        type: DataTypes.INTEGER,
    },
    actionType: {
        allowNull: false,
        type: DataTypes.ENUM('move', 'rangedAttack', 'meleeAttack'),
    },
    actionData: {
        allowNull: false,
        type: DataTypes.JSONB,
    },
    signature: {
        allowNull: true,
        type: DataTypes.JSONB,
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
    sequelize: sequelizeConnection,
});
export default GamePieceAction;
//# sourceMappingURL=game_piece_action.js.map