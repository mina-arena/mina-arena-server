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

export async function serializePiecesTreeFromGameId(
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
  for (const gamePiece of gamePieces) {
    const snarkyPiece = await gamePiece.toSnarkyPiece();
    piecesTree.set(snarkyPiece.id.toBigInt(), snarkyPiece.hash());
  }

  return piecesTree;
}

export async function serializePiecesTreeFromPieces(
  pieces: Array<Models.GamePiece>
): Promise<PiecesMerkleTree> {
  pieces = pieces.sort((a, b) => {
    if (a.id > b.id) {
      return -1;
    } else {
      return 1;
    }
  });
  const piecesTree = new PiecesMerkleTree();
  for (let i = 0; i < pieces.length; i++) {
    const snarkyPiece = await pieces[i].toSnarkyPiece(i + 1);
    piecesTree.set(snarkyPiece.id.toBigInt(), snarkyPiece.hash());
  }
  return piecesTree;
}
