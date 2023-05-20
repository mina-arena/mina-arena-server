import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';

class GameArena extends Model<InferAttributes<GameArena>, InferCreationAttributes<GameArena>> {
  declare id: CreationOptional<number>;
  declare gameId: number;
  declare width: number;
  declare height: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  async game(): Promise<Models.Game> {
    return await Models.Game.findByPk(this.gameId);
  }
}

GameArena.init({
  id: {
    type: DataTypes.INTEGER,
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