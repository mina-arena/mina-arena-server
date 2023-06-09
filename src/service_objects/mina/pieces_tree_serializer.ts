import { Field, UInt32, PublicKey } from 'snarkyjs';
import {
  Piece,
  PiecesMerkleTree,
  Position,
  Unit,
  UnitStats,
} from 'mina-arena-contracts';

import * as Models from '../../models/index.js';
import { Transaction } from 'sequelize';

/**
 * Given a Game ID, find all of the Game Pieces and serialize them into a PiecesMerkleTree
 */

export default async function serializePiecesTree(
  gameId: string | number,
  transaction?: Transaction
): Promise<PiecesMerkleTree> {
  const game = await Models.Game.findByPk(gameId, { transaction });
  if (game.status != 'inProgress')
    throw new Error(
      `Game ${game.id} is not in progress, status: ${game.status}`
    );

  const gamePieces = await Models.GamePiece.findAll({
    where: { gameId },
  });

  const piecesTree = new PiecesMerkleTree();
  gamePieces.forEach(async (gamePiece) => {
    const snarkyPiece = await gamePiece.toSnarkyPiece();
    piecesTree.set(snarkyPiece.id.toBigInt(), snarkyPiece.hash());
  });

  return piecesTree;
}
