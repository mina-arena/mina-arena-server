import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';

export type GamePieceActionType = 'move' | 'rangedAttack' | 'meleeAttack';

export type GameArenaCoordinates = { x: number, y: number };
export type GamePieceMoveAction = { actionType: 'move', data: { moveFrom: GameArenaCoordinates, moveTo: GameArenaCoordinates } };
export type GamePieceRangedAttackAction = { actionType: 'rangedAttack', data: { targetGamePieceId: number } };
export type GamePieceMeleeAttackAction = { actionType: 'meleeAttack', data: { targetGamePieceId: number } };
export type GamePieceActionData = GamePieceMoveAction | GamePieceRangedAttackAction | GamePieceMeleeAttackAction;

class GamePieceAction extends Model<InferAttributes<GamePieceAction>, InferCreationAttributes<GamePieceAction>> {
  declare id: number;
  declare gamePhaseId: number;
  declare gamePlayerId: number;
  declare gamePieceId: number;
  declare actionType: GamePieceActionType;
  declare actionData: GamePieceActionData;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

GamePieceAction.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  gamePhaseId: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  gamePlayerId: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  gamePieceId: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  actionType: {
    allowNull: false,
    type: DataTypes.ENUM('move', 'rangedAttack', 'meleeAttack')
  },
  actionData: {
    allowNull: false,
    type: DataTypes.JSONB
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

export default GamePieceAction;