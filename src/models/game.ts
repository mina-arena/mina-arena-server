import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import { GamePhaseName } from './game_phase.js';

type GameStatus = 'pending' | 'inProgress' | 'completed' | 'canceled';

class Game extends Model<InferAttributes<Game>, InferCreationAttributes<Game>> {
  declare id: number;
  declare status: GameStatus;
  declare turnNumber: CreationOptional<number>;
  declare phase: CreationOptional<GamePhaseName>;
  declare turnPlayerOrder: CreationOptional<string>;
  declare turnGamePlayerId: CreationOptional<number>;
  declare winningGamePlayerId: CreationOptional<number>;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Game.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    allowNull: false,
    type: DataTypes.ENUM('pending', 'inProgress', 'completed', 'canceled')
  },
  turnNumber: {
    type: DataTypes.INTEGER
  },
  phase: {
    type: DataTypes.ENUM('movement', 'shooting', 'melee')
  },
  turnPlayerOrder: {
    type: DataTypes.STRING
  },
  turnGamePlayerId: {
    type: DataTypes.INTEGER
  },
  winningGamePlayerId: {
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

export default Game;