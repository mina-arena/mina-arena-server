import * as Models from '../models/index.js';
import sequelizeConnection from '../db/config.js';

import resolveMoveAction from './game_piece_action_resolvers/move_resolver.js';
import resolveRangedAttackAction from './game_piece_action_resolvers/ranged_attack_resolver.js';
import resolveMeleeAttackAction from './game_piece_action_resolvers/melee_attack_resolver.js';
import { ArenaMerkleTree, PiecesMerkleTree } from 'mina-arena-contracts';

export default async (
  action: Models.GamePieceAction,
  startingPiecesMerkleTree: PiecesMerkleTree,
  startingArenaMerkleTree: ArenaMerkleTree,
  currentPiecesMerkleTree: PiecesMerkleTree,
  currentArenaMerkleTree: ArenaMerkleTree,
  parentTransaction
) => {
  // Resolving an individual action uses its own sub-transaction.
  // This is because each action needs to know the results of
  // the actions resolved before it, for example if a GamePiece
  // is attempting to attack an enemy GamePiece which has
  // already been destroyed by an earlier action.
  return await sequelizeConnection.transaction(async (t) => {
    switch (action.actionData.actionType) {
      case 'move':
        await resolveMoveAction(
          action,
          startingPiecesMerkleTree,
          startingArenaMerkleTree,
          currentPiecesMerkleTree,
          currentArenaMerkleTree,
          t
        );
        break;
      case 'rangedAttack':
        await resolveRangedAttackAction(
          action,
          startingPiecesMerkleTree,
          startingArenaMerkleTree,
          currentPiecesMerkleTree,
          currentArenaMerkleTree,
          t
        );
        break;
      case 'meleeAttack':
        await resolveMeleeAttackAction(
          action,
          startingPiecesMerkleTree,
          startingArenaMerkleTree,
          currentPiecesMerkleTree,
          currentArenaMerkleTree,
          t
        );
        break;
    }
  });
};
