import { DataTypes, Model } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';
class Player extends Model {
    async playerUnits() {
        return await Models.PlayerUnit.findAll({ where: { playerId: this.id } });
    }
    async gamePlayers() {
        return await Models.GamePlayer.findAll({ where: { playerId: this.id } });
    }
}
Player.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    minaPublicKey: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
    },
    updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
    },
    deletedAt: {
        type: DataTypes.DATE
    }
}, {
    sequelize: sequelizeConnection,
    paranoid: true
});
export default Player;
//# sourceMappingURL=player.js.map