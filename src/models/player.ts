import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';

class Player extends Model<InferAttributes<Player>, InferCreationAttributes<Player>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare minaPublicKey: string;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date>;

  async playerUnits(): Promise<Models.PlayerUnit[]> {
    return await Models.PlayerUnit.findAll({ where: { playerId: this.id } });
  }

  async gamePlayers(): Promise<Models.GamePlayer[]> {
    return await Models.GamePlayer.findAll({ where: { playerId: this.id } });
  }
}

Player.init({
  id: {
    type: DataTypes.INTEGER,
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