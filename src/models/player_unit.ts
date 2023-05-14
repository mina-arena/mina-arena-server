import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';

class PlayerUnit extends Model<InferAttributes<PlayerUnit>, InferCreationAttributes<PlayerUnit>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare playerId: number;
  declare unitId: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

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