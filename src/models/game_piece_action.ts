import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';

const ACTION_TYPES = ['move', 'rangedAttack', 'meleeAttack'];
type GamePieceActionTypeTuple = typeof ACTION_TYPES;
export type GamePieceActionType = GamePieceActionTypeTuple[number];

export type GameArenaCoordinates = { x: number, y: number };
export type GamePieceMoveAction = { actionType: 'move', moveFrom: GameArenaCoordinates, moveTo: GameArenaCoordinates };
export type GamePieceRangedAttackAction = { actionType: 'rangedAttack', targetGamePieceId: number };
export type GamePieceMeleeAttackAction = { actionType: 'meleeAttack', targetGamePieceId: number };
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

  async gamePhase(): Promise<Models.GamePhase> {
    return await Models.GamePhase.findByPk(this.gamePhaseId);
  }

  async gamePlayer(): Promise<Models.GamePlayer> {
    return await Models.GamePlayer.findByPk(this.gamePlayerId);
  }

  async gamePiece(): Promise<Models.GamePiece> {
    return await Models.GamePiece.findByPk(this.gamePieceId);
  }
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