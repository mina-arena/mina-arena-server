import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';

const ACTION_TYPES = ['move', 'rangedAttack', 'meleeAttack'];
type GamePieceActionTypeTuple = typeof ACTION_TYPES;
export type GamePieceActionType = GamePieceActionTypeTuple[number];

export type GameArenaCoordinates = { x: number; y: number };
export type GamePieceMoveAction = {
  actionType: 'move';
  resolved: boolean;
  moveFrom: GameArenaCoordinates;
  moveTo: GameArenaCoordinates;
  gamePieceNumber: number;
  nonce: number;
};
export type GamePieceRangedAttackAction = {
  actionType: 'rangedAttack';
  resolved: boolean;
  targetGamePieceId: number;
  encryptedAttackRolls: EncrytpedAttackRollJSON;
  resolvedAttack?: ResolvedAttack;
  totalDamageDealt?: number;
  totalDamageAverage?: number;
  gamePieceNumber: number;
  targetGamePieceNumber: number;
  nonce: number;
};
export type GamePieceMeleeAttackAction = {
  actionType: 'meleeAttack';
  resolved: boolean;
  targetGamePieceId: number;
  encryptedAttackRolls: EncrytpedAttackRollJSON;
  resolvedAttack?: ResolvedAttack;
  totalDamageDealt?: number;
  totalDamageAverage?: number;
  gamePieceNumber: number;
  targetGamePieceNumber: number;
  nonce: number;
};
export type GamePieceActionData =
  | GamePieceMoveAction
  | GamePieceRangedAttackAction
  | GamePieceMeleeAttackAction;

export type ResolvedAttack = {
  hitRoll: RollResult;
  woundRoll: RollResult;
  saveRoll: RollResult;
  damageDealt: number;
  averageDamage: number;
};

export type RollResult = {
  roll: number;
  rollNeeded: number;
  success: boolean;
};

export type EncrytpedAttackRollJSON = {
  publicKey: {
    x: string;
    y: string;
  };
  ciphertext: string[];
  signature: {
    r: string;
    s: string;
  };
  rngPublicKey: string;
};

class GamePieceAction extends Model<
  InferAttributes<GamePieceAction>,
  InferCreationAttributes<GamePieceAction>
> {
  declare id: CreationOptional<number>;
  declare gamePhaseId: number;
  declare gamePlayerId: number;
  declare gamePieceId: number;
  declare actionType: GamePieceActionType;
  declare actionData: GamePieceActionData;
  declare signature: { r: string; s: string } | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

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

GamePieceAction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    gamePhaseId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    gamePlayerId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    gamePieceId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    actionType: {
      allowNull: false,
      type: DataTypes.ENUM('move', 'rangedAttack', 'meleeAttack'),
    },
    actionData: {
      allowNull: false,
      type: DataTypes.JSONB,
    },
    signature: {
      allowNull: true,
      type: DataTypes.JSONB,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: sequelizeConnection,
  }
);

export default GamePieceAction;
