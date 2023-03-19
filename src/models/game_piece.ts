import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import { GamePieceCoordinates } from '../graphql/__generated__/resolvers-types.js';
import * as Models from './index.js';

export function distanceBetweenPoints(point1: GamePieceCoordinates, point2: GamePieceCoordinates): number {
  let dx = point2.x - point1.x;
  let dy = point2.y - point1.y;
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

const INVALID_MOVE_REASONS = [
  'beyondMaxRange',
  'collidesWithOtherPiece'
];
type InvalidMoveReasonTuple = typeof INVALID_MOVE_REASONS;
export type InvalidMoveReason = InvalidMoveReasonTuple[number];
export type CheckMoveValidityResult = {
  moveFrom: GamePieceCoordinates,
  moveTo: GamePieceCoordinates,
  distance: number,
  movementSpeed: number,
  valid: boolean,
  invalidReason?: InvalidMoveReason,
};

class GamePiece extends Model<InferAttributes<GamePiece>, InferCreationAttributes<GamePiece>> {
  declare id: CreationOptional<number>;
  declare gameId: number;
  declare gamePlayerId: number;
  declare playerUnitId: number;
  declare positionX: CreationOptional<number>;
  declare positionY: CreationOptional<number>;
  declare health: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  async game(): Promise<Models.Game> {
    return await Models.Game.findByPk(this.gameId);
  }

  async gamePlayer(): Promise<Models.GamePlayer> {
    return await Models.GamePlayer.findByPk(this.gamePlayerId);
  }

  async playerUnit(): Promise<Models.PlayerUnit> {
    return await Models.PlayerUnit.findByPk(this.playerUnitId);
  }

  async unit(): Promise<Models.Unit> {
    return await (await this.playerUnit()).unit();
  }

  coordinates(): GamePieceCoordinates {
    if (this.positionX == undefined && this.positionY == undefined) return null;
    
    return { x: this.positionX, y: this.positionY };
  }

  isAlive(): boolean {
    return this.health > 0;
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  distanceTo(targetCoordinates: GamePieceCoordinates): number {
    return distanceBetweenPoints(this.coordinates(), targetCoordinates);
  }

  async checkMoveValidity(moveTo: GamePieceCoordinates): Promise<CheckMoveValidityResult> {
    const moveFrom = this.coordinates();
    const distance = this.distanceTo(moveTo);
    const unit = await this.unit();
    const movementSpeed = unit.movementSpeed;
    const resultData = { moveFrom, moveTo, distance, movementSpeed };

    if (distance > unit.movementSpeed) {
      return {
        ...resultData,
        valid: false,
        invalidReason: 'beyondMaxRange',
      };
    }
    
    // TODO: For now we are just looking for units which are literally
    // on this exact spot. We probably want to enforce more space
    // around a unit, giving them some radius.
    const collidingUnits = await Models.GamePiece.findAll({
      where: { gameId: this.gameId, positionX: moveTo.x, positionY: moveTo.y }
    });
    if (collidingUnits.length > 0) {
      return {
        ...resultData,
        valid: false,
        invalidReason: 'collidesWithOtherPiece',
      };
    }

    return { ...resultData, valid: true };
  }
}

GamePiece.init({
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
  playerUnitId: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  positionX: {
    type: DataTypes.INTEGER
  },
  positionY: {
    type: DataTypes.INTEGER
  },
  health: {
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

export default GamePiece;