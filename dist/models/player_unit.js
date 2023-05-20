import { DataTypes, Model } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';
class PlayerUnit extends Model {
    async player() {
        return await Models.Player.findByPk(this.playerId);
    }
    async unit() {
        return await Models.Unit.findByPk(this.unitId);
    }
    async gamePieces() {
        return await Models.GamePiece.findAll({ where: { playerUnitId: this.id } });
    }
}
PlayerUnit.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    playerId: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    unitId: {
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
export default PlayerUnit;
//# sourceMappingURL=player_unit.js.map