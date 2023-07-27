import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from 'graphql';
import {
  GameArena as GameArenaModel,
  GamePhase as GamePhaseModel,
  GamePieceAction as GamePieceActionModel,
  GamePiece as GamePieceModel,
  GamePlayer as GamePlayerModel,
  Game as GameModel,
  PlayerUnit as PlayerUnitModel,
  Player as PlayerModel,
  Unit as UnitModel,
} from '../../models/index.js';
import { GamePhaseName as GamePhaseNameModel } from '../../models/game_phase.js';
import {
  GamePieceActionData as GamePieceActionDataModel,
  GamePieceRangedAttackAction as GamePieceRangedAttackActionModel,
  GamePieceMeleeAttackAction as GamePieceMeleeAttackActionModel,
} from '../../models/game_piece_action.js';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type EnumResolverSignature<T, AllowedValues = any> = {
  [key in keyof T]?: AllowedValues;
};
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Iso8601DateTime: any;
};

export type CreateGameInput = {
  arenaHeight: Scalars['Int'];
  arenaWidth: Scalars['Int'];
  players: Array<CreateGamePlayerInput>;
};

export type CreateGamePieceActionInput = {
  actionType: GamePieceActionType;
  gamePieceId: Scalars['Int'];
  meleeAttackInput?: InputMaybe<GamePieceMeleeAttackActionInput>;
  moveInput?: InputMaybe<GamePieceMoveActionInput>;
  rangedAttackInput?: InputMaybe<GamePieceRangedAttackActionInput>;
  signature: SignatureInput;
};

export type CreateGamePieceActionsInput = {
  actions: Array<CreateGamePieceActionInput>;
  gameId: Scalars['Int'];
  minaPublicKey: Scalars['String'];
};

export type CreateGamePieceInput = {
  createPlayerUnit?: InputMaybe<CreatePlayerUnitInput>;
  playerUnitId?: InputMaybe<Scalars['Int']>;
};

export type CreateGamePiecesInput = {
  gameId: Scalars['Int'];
  gamePieces: Array<CreateGamePieceInput>;
  minaPublicKey: Scalars['String'];
};

export type CreateGamePlayerInput = {
  minaPublicKey: Scalars['String'];
  name: Scalars['String'];
  playerNumber: Scalars['Int'];
};

export type CreatePlayerUnitInput = {
  name: Scalars['String'];
  unitId: Scalars['Int'];
};

export type DiceRoll = {
  __typename?: 'DiceRoll';
  cipherText: Scalars['String'];
  publicKey?: Maybe<PublicKeyGroup>;
  signature?: Maybe<Signature>;
};

export type DiceRollInput = {
  cipherText: Scalars['String'];
  publicKey: PublicKeyGroupInput;
  signature: SignatureInput;
};

export type Game = {
  __typename?: 'Game';
  arena?: Maybe<GameArena>;
  createdAt: Scalars['Iso8601DateTime'];
  currentPhase?: Maybe<GamePhase>;
  gamePhases: Array<GamePhase>;
  gamePieces: Array<GamePiece>;
  gamePlayers: Array<GamePlayer>;
  id: Scalars['Int'];
  previousPhase?: Maybe<GamePhase>;
  status: GameStatus;
  turnGamePlayer?: Maybe<GamePlayer>;
  turnNumber?: Maybe<Scalars['Int']>;
  turnPlayerOrder: Array<GamePlayer>;
  updatedAt: Scalars['Iso8601DateTime'];
  winningGamePlayer?: Maybe<GamePlayer>;
};

export type GameArena = {
  __typename?: 'GameArena';
  createdAt: Scalars['Iso8601DateTime'];
  game: Game;
  height: Scalars['Int'];
  id: Scalars['Int'];
  updatedAt: Scalars['Iso8601DateTime'];
  width: Scalars['Int'];
};

export type GamePhase = {
  __typename?: 'GamePhase';
  createdAt: Scalars['Iso8601DateTime'];
  finalPhaseState?: Maybe<Scalars['String']>;
  game: Game;
  gamePieceActions: Array<GamePieceAction>;
  gamePlayer: GamePlayer;
  id: Scalars['Int'];
  initialPhaseState?: Maybe<Scalars['String']>;
  name: GamePhaseName;
  turnNumber: Scalars['Int'];
  updatedAt: Scalars['Iso8601DateTime'];
};

export enum GamePhaseName {
  Melee = 'MELEE',
  Movement = 'MOVEMENT',
  Shooting = 'SHOOTING',
}

export type GamePiece = {
  __typename?: 'GamePiece';
  coordinates?: Maybe<GamePieceCoordinates>;
  createdAt: Scalars['Iso8601DateTime'];
  game: Game;
  gamePieceActions: Array<GamePieceAction>;
  gamePieceNumber: Scalars['Int'];
  gamePlayer: GamePlayer;
  hash: Scalars['String'];
  health: Scalars['Int'];
  id: Scalars['Int'];
  playerUnit: PlayerUnit;
  updatedAt: Scalars['Iso8601DateTime'];
};

export type GamePieceAction = {
  __typename?: 'GamePieceAction';
  actionData: GamePieceActionData;
  actionType: GamePieceActionType;
  createdAt: Scalars['Iso8601DateTime'];
  gamePhase: GamePhase;
  gamePiece: GamePiece;
  gamePlayer: GamePlayer;
  id: Scalars['Int'];
  updatedAt: Scalars['Iso8601DateTime'];
};

export type GamePieceActionData =
  | GamePieceMeleeAttackAction
  | GamePieceMoveAction
  | GamePieceRangedAttackAction;

export enum GamePieceActionType {
  MeleeAttack = 'MELEE_ATTACK',
  Move = 'MOVE',
  RangedAttack = 'RANGED_ATTACK',
}

export type GamePieceCoordinates = {
  __typename?: 'GamePieceCoordinates';
  x: Scalars['Int'];
  y: Scalars['Int'];
};

export type GamePieceCoordinatesInput = {
  x: Scalars['Int'];
  y: Scalars['Int'];
};

export type GamePieceMeleeAttackAction = {
  __typename?: 'GamePieceMeleeAttackAction';
  resolved: Scalars['Boolean'];
  resolvedAttack?: Maybe<ResolvedAttack>;
  rollInput?: Maybe<Scalars['String']>;
  targetGamePiece: GamePiece;
  totalDamageAverage?: Maybe<Scalars['Float']>;
  totalDamageDealt?: Maybe<Scalars['Int']>;
};

export type GamePieceMeleeAttackActionInput = {
  diceRolls: DiceRollInput;
  gamePieceNumber: Scalars['Int'];
  nonce: Scalars['Int'];
  targetGamePieceId: Scalars['Int'];
  targetGamePieceNumber: Scalars['Int'];
};

export type GamePieceMoveAction = {
  __typename?: 'GamePieceMoveAction';
  moveFrom: GamePieceCoordinates;
  moveTo: GamePieceCoordinates;
  resolved: Scalars['Boolean'];
};

export type GamePieceMoveActionInput = {
  gamePieceNumber: Scalars['Int'];
  moveFrom: GamePieceCoordinatesInput;
  moveTo: GamePieceCoordinatesInput;
  nonce: Scalars['Int'];
};

export type GamePieceRangedAttackAction = {
  __typename?: 'GamePieceRangedAttackAction';
  resolved: Scalars['Boolean'];
  resolvedAttack?: Maybe<ResolvedAttack>;
  rollInput?: Maybe<Scalars['String']>;
  targetGamePiece: GamePiece;
  totalDamageAverage?: Maybe<Scalars['Float']>;
  totalDamageDealt?: Maybe<Scalars['Int']>;
};

export type GamePieceRangedAttackActionInput = {
  diceRolls: DiceRollInput;
  gamePieceNumber: Scalars['Int'];
  nonce: Scalars['Int'];
  targetGamePieceId: Scalars['Int'];
  targetGamePieceNumber: Scalars['Int'];
};

export type GamePlayer = {
  __typename?: 'GamePlayer';
  createdAt: Scalars['Iso8601DateTime'];
  game: Game;
  gamePhases: Array<GamePhase>;
  gamePieceActions: Array<GamePieceAction>;
  id: Scalars['Int'];
  player: Player;
  playerNumber: Scalars['Int'];
  updatedAt: Scalars['Iso8601DateTime'];
};

export enum GameStatus {
  Canceled = 'CANCELED',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING',
}

export type Mutation = {
  __typename?: 'Mutation';
  createGame?: Maybe<Game>;
  createGamePieceActions?: Maybe<Array<GamePieceAction>>;
  createGamePieces?: Maybe<Array<GamePiece>>;
  startGame?: Maybe<Game>;
  submitGamePhase?: Maybe<Game>;
};

export type MutationCreateGameArgs = {
  input: CreateGameInput;
};

export type MutationCreateGamePieceActionsArgs = {
  input: CreateGamePieceActionsInput;
};

export type MutationCreateGamePiecesArgs = {
  input: CreateGamePiecesInput;
};

export type MutationStartGameArgs = {
  input: StartGameInput;
};

export type MutationSubmitGamePhaseArgs = {
  input: SubmitGamePhaseInput;
};

export type Player = {
  __typename?: 'Player';
  createdAt: Scalars['Iso8601DateTime'];
  id: Scalars['Int'];
  minaPublicKey: Scalars['String'];
  name: Scalars['String'];
  playerUnits: Array<PlayerUnit>;
  updatedAt: Scalars['Iso8601DateTime'];
};

export type PlayerUnit = {
  __typename?: 'PlayerUnit';
  createdAt: Scalars['Iso8601DateTime'];
  id: Scalars['Int'];
  name: Scalars['String'];
  player: Player;
  unit: Unit;
  updatedAt: Scalars['Iso8601DateTime'];
};

export type PublicKeyGroup = {
  __typename?: 'PublicKeyGroup';
  x: Scalars['String'];
  y: Scalars['String'];
};

export type PublicKeyGroupInput = {
  x: Scalars['String'];
  y: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  game?: Maybe<Game>;
  games: Array<Game>;
  gamesForPlayer: Array<Game>;
  player?: Maybe<Player>;
  units: Array<Unit>;
};

export type QueryGameArgs = {
  id: Scalars['Int'];
};

export type QueryGamesForPlayerArgs = {
  minaPublicKey: Scalars['String'];
  statuses?: InputMaybe<Array<InputMaybe<GameStatus>>>;
};

export type QueryPlayerArgs = {
  minaPublicKey: Scalars['String'];
};

export type ResolvedAttack = {
  __typename?: 'ResolvedAttack';
  averageDamage: Scalars['Float'];
  damageDealt: Scalars['Int'];
  hitRoll: RollResult;
  saveRoll: RollResult;
  woundRoll: RollResult;
};

export type RollResult = {
  __typename?: 'RollResult';
  roll: Scalars['Int'];
  rollNeeded: Scalars['Int'];
  success: Scalars['Boolean'];
};

export type Signature = {
  __typename?: 'Signature';
  r: Scalars['String'];
  s: Scalars['String'];
};

export type SignatureInput = {
  r: Scalars['String'];
  s: Scalars['String'];
};

export type StartGameInput = {
  gameId: Scalars['Int'];
};

export type SubmitGamePhaseInput = {
  gamePhaseId: Scalars['Int'];
  minaPublicKey: Scalars['String'];
};

export type Unit = {
  __typename?: 'Unit';
  armorSaveRoll: Scalars['Int'];
  createdAt: Scalars['Iso8601DateTime'];
  id: Scalars['Int'];
  maxHealth: Scalars['Int'];
  meleeArmorPiercing: Scalars['Int'];
  meleeDamage: Scalars['Int'];
  meleeHitRoll: Scalars['Int'];
  meleeNumAttacks: Scalars['Int'];
  meleeWoundRoll: Scalars['Int'];
  movementSpeed: Scalars['Int'];
  name: Scalars['String'];
  pointsCost: Scalars['Int'];
  rangedAmmo?: Maybe<Scalars['Int']>;
  rangedArmorPiercing?: Maybe<Scalars['Int']>;
  rangedDamage?: Maybe<Scalars['Int']>;
  rangedHitRoll?: Maybe<Scalars['Int']>;
  rangedNumAttacks?: Maybe<Scalars['Int']>;
  rangedRange?: Maybe<Scalars['Int']>;
  rangedWoundRoll?: Maybe<Scalars['Int']>;
  updatedAt: Scalars['Iso8601DateTime'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CreateGameInput: CreateGameInput;
  CreateGamePieceActionInput: CreateGamePieceActionInput;
  CreateGamePieceActionsInput: CreateGamePieceActionsInput;
  CreateGamePieceInput: CreateGamePieceInput;
  CreateGamePiecesInput: CreateGamePiecesInput;
  CreateGamePlayerInput: CreateGamePlayerInput;
  CreatePlayerUnitInput: CreatePlayerUnitInput;
  DiceRoll: ResolverTypeWrapper<DiceRoll>;
  DiceRollInput: DiceRollInput;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Game: ResolverTypeWrapper<GameModel>;
  GameArena: ResolverTypeWrapper<GameArenaModel>;
  GamePhase: ResolverTypeWrapper<GamePhaseModel>;
  GamePhaseName: ResolverTypeWrapper<GamePhaseNameModel>;
  GamePiece: ResolverTypeWrapper<GamePieceModel>;
  GamePieceAction: ResolverTypeWrapper<GamePieceActionModel>;
  GamePieceActionData: ResolverTypeWrapper<GamePieceActionDataModel>;
  GamePieceActionType: GamePieceActionType;
  GamePieceCoordinates: ResolverTypeWrapper<GamePieceCoordinates>;
  GamePieceCoordinatesInput: GamePieceCoordinatesInput;
  GamePieceMeleeAttackAction: ResolverTypeWrapper<GamePieceMeleeAttackActionModel>;
  GamePieceMeleeAttackActionInput: GamePieceMeleeAttackActionInput;
  GamePieceMoveAction: ResolverTypeWrapper<GamePieceMoveAction>;
  GamePieceMoveActionInput: GamePieceMoveActionInput;
  GamePieceRangedAttackAction: ResolverTypeWrapper<GamePieceRangedAttackActionModel>;
  GamePieceRangedAttackActionInput: GamePieceRangedAttackActionInput;
  GamePlayer: ResolverTypeWrapper<GamePlayerModel>;
  GameStatus: GameStatus;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Iso8601DateTime: ResolverTypeWrapper<Scalars['Iso8601DateTime']>;
  Mutation: ResolverTypeWrapper<{}>;
  Player: ResolverTypeWrapper<PlayerModel>;
  PlayerUnit: ResolverTypeWrapper<PlayerUnitModel>;
  PublicKeyGroup: ResolverTypeWrapper<PublicKeyGroup>;
  PublicKeyGroupInput: PublicKeyGroupInput;
  Query: ResolverTypeWrapper<{}>;
  ResolvedAttack: ResolverTypeWrapper<ResolvedAttack>;
  RollResult: ResolverTypeWrapper<RollResult>;
  Signature: ResolverTypeWrapper<Signature>;
  SignatureInput: SignatureInput;
  StartGameInput: StartGameInput;
  String: ResolverTypeWrapper<Scalars['String']>;
  SubmitGamePhaseInput: SubmitGamePhaseInput;
  Unit: ResolverTypeWrapper<UnitModel>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean'];
  CreateGameInput: CreateGameInput;
  CreateGamePieceActionInput: CreateGamePieceActionInput;
  CreateGamePieceActionsInput: CreateGamePieceActionsInput;
  CreateGamePieceInput: CreateGamePieceInput;
  CreateGamePiecesInput: CreateGamePiecesInput;
  CreateGamePlayerInput: CreateGamePlayerInput;
  CreatePlayerUnitInput: CreatePlayerUnitInput;
  DiceRoll: DiceRoll;
  DiceRollInput: DiceRollInput;
  Float: Scalars['Float'];
  Game: GameModel;
  GameArena: GameArenaModel;
  GamePhase: GamePhaseModel;
  GamePiece: GamePieceModel;
  GamePieceAction: GamePieceActionModel;
  GamePieceActionData: GamePieceActionDataModel;
  GamePieceCoordinates: GamePieceCoordinates;
  GamePieceCoordinatesInput: GamePieceCoordinatesInput;
  GamePieceMeleeAttackAction: GamePieceMeleeAttackActionModel;
  GamePieceMeleeAttackActionInput: GamePieceMeleeAttackActionInput;
  GamePieceMoveAction: GamePieceMoveAction;
  GamePieceMoveActionInput: GamePieceMoveActionInput;
  GamePieceRangedAttackAction: GamePieceRangedAttackActionModel;
  GamePieceRangedAttackActionInput: GamePieceRangedAttackActionInput;
  GamePlayer: GamePlayerModel;
  Int: Scalars['Int'];
  Iso8601DateTime: Scalars['Iso8601DateTime'];
  Mutation: {};
  Player: PlayerModel;
  PlayerUnit: PlayerUnitModel;
  PublicKeyGroup: PublicKeyGroup;
  PublicKeyGroupInput: PublicKeyGroupInput;
  Query: {};
  ResolvedAttack: ResolvedAttack;
  RollResult: RollResult;
  Signature: Signature;
  SignatureInput: SignatureInput;
  StartGameInput: StartGameInput;
  String: Scalars['String'];
  SubmitGamePhaseInput: SubmitGamePhaseInput;
  Unit: UnitModel;
}>;

export type DiceRollResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['DiceRoll'] = ResolversParentTypes['DiceRoll']
> = ResolversObject<{
  cipherText?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  publicKey?: Resolver<
    Maybe<ResolversTypes['PublicKeyGroup']>,
    ParentType,
    ContextType
  >;
  signature?: Resolver<
    Maybe<ResolversTypes['Signature']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GameResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Game'] = ResolversParentTypes['Game']
> = ResolversObject<{
  arena?: Resolver<Maybe<ResolversTypes['GameArena']>, ParentType, ContextType>;
  createdAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  currentPhase?: Resolver<
    Maybe<ResolversTypes['GamePhase']>,
    ParentType,
    ContextType
  >;
  gamePhases?: Resolver<
    Array<ResolversTypes['GamePhase']>,
    ParentType,
    ContextType
  >;
  gamePieces?: Resolver<
    Array<ResolversTypes['GamePiece']>,
    ParentType,
    ContextType
  >;
  gamePlayers?: Resolver<
    Array<ResolversTypes['GamePlayer']>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  previousPhase?: Resolver<
    Maybe<ResolversTypes['GamePhase']>,
    ParentType,
    ContextType
  >;
  status?: Resolver<ResolversTypes['GameStatus'], ParentType, ContextType>;
  turnGamePlayer?: Resolver<
    Maybe<ResolversTypes['GamePlayer']>,
    ParentType,
    ContextType
  >;
  turnNumber?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  turnPlayerOrder?: Resolver<
    Array<ResolversTypes['GamePlayer']>,
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  winningGamePlayer?: Resolver<
    Maybe<ResolversTypes['GamePlayer']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GameArenaResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['GameArena'] = ResolversParentTypes['GameArena']
> = ResolversObject<{
  createdAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  game?: Resolver<ResolversTypes['Game'], ParentType, ContextType>;
  height?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  width?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GamePhaseResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['GamePhase'] = ResolversParentTypes['GamePhase']
> = ResolversObject<{
  createdAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  finalPhaseState?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  game?: Resolver<ResolversTypes['Game'], ParentType, ContextType>;
  gamePieceActions?: Resolver<
    Array<ResolversTypes['GamePieceAction']>,
    ParentType,
    ContextType
  >;
  gamePlayer?: Resolver<ResolversTypes['GamePlayer'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  initialPhaseState?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  name?: Resolver<ResolversTypes['GamePhaseName'], ParentType, ContextType>;
  turnNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GamePhaseNameResolvers = EnumResolverSignature<
  { MELEE?: any; MOVEMENT?: any; SHOOTING?: any },
  ResolversTypes['GamePhaseName']
>;

export type GamePieceResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['GamePiece'] = ResolversParentTypes['GamePiece']
> = ResolversObject<{
  coordinates?: Resolver<
    Maybe<ResolversTypes['GamePieceCoordinates']>,
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  game?: Resolver<ResolversTypes['Game'], ParentType, ContextType>;
  gamePieceActions?: Resolver<
    Array<ResolversTypes['GamePieceAction']>,
    ParentType,
    ContextType
  >;
  gamePieceNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  gamePlayer?: Resolver<ResolversTypes['GamePlayer'], ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  health?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  playerUnit?: Resolver<ResolversTypes['PlayerUnit'], ParentType, ContextType>;
  updatedAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GamePieceActionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['GamePieceAction'] = ResolversParentTypes['GamePieceAction']
> = ResolversObject<{
  actionData?: Resolver<
    ResolversTypes['GamePieceActionData'],
    ParentType,
    ContextType
  >;
  actionType?: Resolver<
    ResolversTypes['GamePieceActionType'],
    ParentType,
    ContextType
  >;
  createdAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  gamePhase?: Resolver<ResolversTypes['GamePhase'], ParentType, ContextType>;
  gamePiece?: Resolver<ResolversTypes['GamePiece'], ParentType, ContextType>;
  gamePlayer?: Resolver<ResolversTypes['GamePlayer'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GamePieceActionDataResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['GamePieceActionData'] = ResolversParentTypes['GamePieceActionData']
> = ResolversObject<{
  __resolveType: TypeResolveFn<
    | 'GamePieceMeleeAttackAction'
    | 'GamePieceMoveAction'
    | 'GamePieceRangedAttackAction',
    ParentType,
    ContextType
  >;
}>;

export type GamePieceCoordinatesResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['GamePieceCoordinates'] = ResolversParentTypes['GamePieceCoordinates']
> = ResolversObject<{
  x?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  y?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GamePieceMeleeAttackActionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['GamePieceMeleeAttackAction'] = ResolversParentTypes['GamePieceMeleeAttackAction']
> = ResolversObject<{
  resolved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  resolvedAttack?: Resolver<
    Maybe<ResolversTypes['ResolvedAttack']>,
    ParentType,
    ContextType
  >;
  rollInput?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  targetGamePiece?: Resolver<
    ResolversTypes['GamePiece'],
    ParentType,
    ContextType
  >;
  totalDamageAverage?: Resolver<
    Maybe<ResolversTypes['Float']>,
    ParentType,
    ContextType
  >;
  totalDamageDealt?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GamePieceMoveActionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['GamePieceMoveAction'] = ResolversParentTypes['GamePieceMoveAction']
> = ResolversObject<{
  moveFrom?: Resolver<
    ResolversTypes['GamePieceCoordinates'],
    ParentType,
    ContextType
  >;
  moveTo?: Resolver<
    ResolversTypes['GamePieceCoordinates'],
    ParentType,
    ContextType
  >;
  resolved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GamePieceRangedAttackActionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['GamePieceRangedAttackAction'] = ResolversParentTypes['GamePieceRangedAttackAction']
> = ResolversObject<{
  resolved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  resolvedAttack?: Resolver<
    Maybe<ResolversTypes['ResolvedAttack']>,
    ParentType,
    ContextType
  >;
  rollInput?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  targetGamePiece?: Resolver<
    ResolversTypes['GamePiece'],
    ParentType,
    ContextType
  >;
  totalDamageAverage?: Resolver<
    Maybe<ResolversTypes['Float']>,
    ParentType,
    ContextType
  >;
  totalDamageDealt?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GamePlayerResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['GamePlayer'] = ResolversParentTypes['GamePlayer']
> = ResolversObject<{
  createdAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  game?: Resolver<ResolversTypes['Game'], ParentType, ContextType>;
  gamePhases?: Resolver<
    Array<ResolversTypes['GamePhase']>,
    ParentType,
    ContextType
  >;
  gamePieceActions?: Resolver<
    Array<ResolversTypes['GamePieceAction']>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>;
  playerNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface Iso8601DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Iso8601DateTime'], any> {
  name: 'Iso8601DateTime';
}

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = ResolversObject<{
  createGame?: Resolver<
    Maybe<ResolversTypes['Game']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateGameArgs, 'input'>
  >;
  createGamePieceActions?: Resolver<
    Maybe<Array<ResolversTypes['GamePieceAction']>>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateGamePieceActionsArgs, 'input'>
  >;
  createGamePieces?: Resolver<
    Maybe<Array<ResolversTypes['GamePiece']>>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateGamePiecesArgs, 'input'>
  >;
  startGame?: Resolver<
    Maybe<ResolversTypes['Game']>,
    ParentType,
    ContextType,
    RequireFields<MutationStartGameArgs, 'input'>
  >;
  submitGamePhase?: Resolver<
    Maybe<ResolversTypes['Game']>,
    ParentType,
    ContextType,
    RequireFields<MutationSubmitGamePhaseArgs, 'input'>
  >;
}>;

export type PlayerResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Player'] = ResolversParentTypes['Player']
> = ResolversObject<{
  createdAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  minaPublicKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  playerUnits?: Resolver<
    Array<ResolversTypes['PlayerUnit']>,
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlayerUnitResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlayerUnit'] = ResolversParentTypes['PlayerUnit']
> = ResolversObject<{
  createdAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  player?: Resolver<ResolversTypes['Player'], ParentType, ContextType>;
  unit?: Resolver<ResolversTypes['Unit'], ParentType, ContextType>;
  updatedAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PublicKeyGroupResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PublicKeyGroup'] = ResolversParentTypes['PublicKeyGroup']
> = ResolversObject<{
  x?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  y?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = ResolversObject<{
  game?: Resolver<
    Maybe<ResolversTypes['Game']>,
    ParentType,
    ContextType,
    RequireFields<QueryGameArgs, 'id'>
  >;
  games?: Resolver<Array<ResolversTypes['Game']>, ParentType, ContextType>;
  gamesForPlayer?: Resolver<
    Array<ResolversTypes['Game']>,
    ParentType,
    ContextType,
    RequireFields<QueryGamesForPlayerArgs, 'minaPublicKey'>
  >;
  player?: Resolver<
    Maybe<ResolversTypes['Player']>,
    ParentType,
    ContextType,
    RequireFields<QueryPlayerArgs, 'minaPublicKey'>
  >;
  units?: Resolver<Array<ResolversTypes['Unit']>, ParentType, ContextType>;
}>;

export type ResolvedAttackResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['ResolvedAttack'] = ResolversParentTypes['ResolvedAttack']
> = ResolversObject<{
  averageDamage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  damageDealt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  hitRoll?: Resolver<ResolversTypes['RollResult'], ParentType, ContextType>;
  saveRoll?: Resolver<ResolversTypes['RollResult'], ParentType, ContextType>;
  woundRoll?: Resolver<ResolversTypes['RollResult'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RollResultResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['RollResult'] = ResolversParentTypes['RollResult']
> = ResolversObject<{
  roll?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  rollNeeded?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SignatureResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Signature'] = ResolversParentTypes['Signature']
> = ResolversObject<{
  r?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  s?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UnitResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Unit'] = ResolversParentTypes['Unit']
> = ResolversObject<{
  armorSaveRoll?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  maxHealth?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  meleeArmorPiercing?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  meleeDamage?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  meleeHitRoll?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  meleeNumAttacks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  meleeWoundRoll?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  movementSpeed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pointsCost?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  rangedAmmo?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rangedArmorPiercing?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  rangedDamage?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  rangedHitRoll?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  rangedNumAttacks?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  rangedRange?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rangedWoundRoll?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  updatedAt?: Resolver<
    ResolversTypes['Iso8601DateTime'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  DiceRoll?: DiceRollResolvers<ContextType>;
  Game?: GameResolvers<ContextType>;
  GameArena?: GameArenaResolvers<ContextType>;
  GamePhase?: GamePhaseResolvers<ContextType>;
  GamePhaseName?: GamePhaseNameResolvers;
  GamePiece?: GamePieceResolvers<ContextType>;
  GamePieceAction?: GamePieceActionResolvers<ContextType>;
  GamePieceActionData?: GamePieceActionDataResolvers<ContextType>;
  GamePieceCoordinates?: GamePieceCoordinatesResolvers<ContextType>;
  GamePieceMeleeAttackAction?: GamePieceMeleeAttackActionResolvers<ContextType>;
  GamePieceMoveAction?: GamePieceMoveActionResolvers<ContextType>;
  GamePieceRangedAttackAction?: GamePieceRangedAttackActionResolvers<ContextType>;
  GamePlayer?: GamePlayerResolvers<ContextType>;
  Iso8601DateTime?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Player?: PlayerResolvers<ContextType>;
  PlayerUnit?: PlayerUnitResolvers<ContextType>;
  PublicKeyGroup?: PublicKeyGroupResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ResolvedAttack?: ResolvedAttackResolvers<ContextType>;
  RollResult?: RollResultResolvers<ContextType>;
  Signature?: SignatureResolvers<ContextType>;
  Unit?: UnitResolvers<ContextType>;
}>;
