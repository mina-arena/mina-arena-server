import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelizeConnection from '../db/config.js';
import { GamePieceActionType } from './game_piece_action.js';
import * as Models from './index.js';
import resolveGamePhase from '../service_objects/game_phase_resolver.js';

export type GamePhaseName = 'movement' | 'shooting' | 'melee';
export const ALLOWED_ACTIONS_PER_PHASE: Record<
  GamePhaseName,
  GamePieceActionType[]
> = {
  movement: ['move'],
  shooting: ['rangedAttack'],
  melee: ['meleeAttack'],
};

export const GAME_PHASE_ORDER: GamePhaseName[] = [
  'movement',
  'shooting',
  'melee',
];

export type PhaseStateJSON = {
  nonce: number;
  actionsNonce: number;
  startingPiecesState: string;
  currentPiecesState: string;
  startingArenaState: string;
  currentArenaState: string;
  playerPublicKey: string;
};

class GamePhase extends Model<
  InferAttributes<GamePhase>,
  InferCreationAttributes<GamePhase>
> {
  declare id: CreationOptional<number>;
  declare gameId: number;
  declare gamePlayerId: number;
  declare turnNumber: number;
  declare phase: GamePhaseName;
  declare initialPhaseState: CreationOptional<string>;
  declare finalPhaseState: CreationOptional<string>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  async game(): Promise<Models.Game> {
    return await Models.Game.findByPk(this.gameId);
  }

  async gamePlayer(): Promise<Models.GamePlayer> {
    return await Models.GamePlayer.findByPk(this.gamePlayerId);
  }

  async gamePieceActions(): Promise<Models.GamePieceAction[]> {
    return await Models.GamePieceAction.findAll({
      where: { gamePhaseId: this.id },
      order: [['id', 'ASC']],
    });
  }

  actionTypeAllowed(actionType: GamePieceActionType): boolean {
    let allowedActionTypes = ALLOWED_ACTIONS_PER_PHASE[this.phase];
    return allowedActionTypes.includes(actionType);
  }

  async resolve(transaction): Promise<Models.Game> {
    return await resolveGamePhase(this, transaction);
  }
}

GamePhase.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    gameId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    gamePlayerId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    turnNumber: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    phase: {
      allowNull: false,
      type: DataTypes.ENUM('movement', 'shooting', 'melee'),
    },
    initialPhaseState: {
      type: DataTypes.STRING,
    },
    finalPhaseState: {
      type: DataTypes.STRING,
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

export default GamePhase;
