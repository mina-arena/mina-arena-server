import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';

class PlayerUnit extends Model<InferAttributes<PlayerUnit>, InferCreationAttributes<PlayerUnit>> {
  declare id: number;
  declare name: string;
  declare playerId: number;
  declare unitId: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  async player(): Promise<Models.Player> {
    return await Models.Player.findByPk(this.playerId);
  }

  async unit(): Promise<Models.Unit> {
    return await Models.Unit.findByPk(this.unitId);
  }

  async gamePieces(): Promise<Models.GamePiece[]> {
    return await Models.GamePiece.findAll({ where: { playerUnitId: this.id }});
  }
}

PlayerUnit.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
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
  hooks: {
    afterDestroy: async (playerUnit, options) => {
      await Models.GamePiece.destroy({ where: { playerUnitId: playerUnit.id }});
    }
  },
  sequelize: sequelizeConnection
});

export default PlayerUnit;