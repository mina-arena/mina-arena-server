import { DataTypes, Model } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';
import resolveGamePhase from '../service_objects/game_phase_resolver.js';
export const ALLOWED_ACTIONS_PER_PHASE = {
    'movement': ['move'],
    'shooting': ['rangedAttack'],
    'melee': ['meleeAttack']
};
// TODO: For now, each player's turn will only consist of one movement phase
// export const GAME_PHASE_ORDER: GamePhaseName[] = ['movement', 'shooting', 'melee'];
export const GAME_PHASE_ORDER = ['movement'];
class GamePhase extends Model {
    async game() {
        return await Models.Game.findByPk(this.gameId);
    }
    async gamePlayer() {
        return await Models.GamePlayer.findByPk(this.gamePlayerId);
    }
    async gamePieceActions() {
        return await Models.GamePieceAction.findAll({
            where: { gamePhaseId: this.id },
            order: [['id', 'ASC']]
        });
    }
    actionTypeAllowed(actionType) {
        let allowedActionTypes = ALLOWED_ACTIONS_PER_PHASE[this.phase];
        return allowedActionTypes.includes(actionType);
    }
    async resolve(transaction) {
        return await resolveGamePhase(this, transaction);
    }
}
GamePhase.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    gameId: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    gamePlayerId: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    turnNumber: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    phase: {
        allowNull: false,
        type: DataTypes.ENUM('movement', 'shooting', 'melee')
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
export default GamePhase;
//# sourceMappingURL=game_phase.js.map