import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';

export type GamePhaseName = 'movement' | 'shooting' | 'melee';

class GamePhase extends Model<InferAttributes<GamePhase>, InferCreationAttributes<GamePhase>> {
  declare id: number;
  declare gameId: number;
  declare gamePlayerId: number;
  declare turnNumber: number;
  declare phase: GamePhaseName;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
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