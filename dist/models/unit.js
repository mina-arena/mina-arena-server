import { DataTypes, Model } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';
export const MELEE_ATTACK_RANGE = 5;
export const RANGED_ATTACK_RANGE = 35;
class Unit extends Model {
    async playerUnits() {
        return await Models.PlayerUnit.findAll({ where: { unitId: this.id } });
    }
    pointsCost() {
        return this.attackPower + this.armor + this.maxHealth;
    }
}
Unit.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    attackPower: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    armor: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    maxHealth: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    movementSpeed: {
        type: DataTypes.INTEGER,
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
}, {
    sequelize: sequelizeConnection
});
export default Unit;
//# sourceMappingURL=unit.js.map