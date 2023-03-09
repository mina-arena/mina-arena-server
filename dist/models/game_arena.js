import { DataTypes, Model } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';
class GameArena extends Model {
    async game() {
        return await Models.Game.findByPk(this.gameId);
    }
}
GameArena.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    gameId: {
        allowNull: false,
        type: DataTypes.INTEGER,
    },
    width: {
        allowNull: false,
        type: DataTypes.INTEGER,
    },
    height: {
        allowNull: false,
        type: DataTypes.INTEGER,
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
export default GameArena;
//# sourceMappingURL=game_arena.js.map