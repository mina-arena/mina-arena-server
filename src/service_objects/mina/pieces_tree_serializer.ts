import { Field, UInt32, PublicKey } from 'snarkyjs';
import {
  Piece,
  PiecesMerkleTree,
  Position,
  Unit,
  UnitStats
} from 'mina-arena-contracts';

import * as Models from '../../models/index.js';
import { Transaction } from 'sequelize';

/**
 * Given a Game ID, find all of the Game Pieces and serialize them into a PiecesMerkleTree
 */

export default async function serializePiecesTree(gameId: string | number, transaction?: Transaction): Promise<PiecesMerkleTree> {
  const game = await Models.Game.findByPk(gameId, { transaction });
  if (game.status != 'inProgress') throw new Error(`Game ${game.id} is not in progress, status: ${game.status}`);

  const gamePieces = await Models.GamePiece.findAll({
    where: { gameId }
  });

  const piecesTree = new PiecesMerkleTree();
  gamePieces.forEach(async (gamePiece) => {
    const playerUnit = await gamePiece.playerUnit();
    const unit = await playerUnit.unit();
    const gamePlayer = await gamePiece.gamePlayer();
    const player = await gamePlayer.player();
    const snarkyUnit = new Unit({
      stats: new UnitStats({
        health: UInt32.from(gamePiece.health),
        movement: UInt32.from(unit.movementSpeed),
        rangedAttackRange: UInt32.from(unit.rangedRange),
        rangedHitRoll: UInt32.from(unit.rangedHitRoll),
        rangedWoundRoll: UInt32.from(unit.rangedWoundRoll),
        saveRoll: UInt32.from(unit.armorSaveRoll),
        rangedDamage: UInt32.from(unit.rangedDamage),
        meleeHitRoll: UInt32.from(unit.meleeHitRoll),
        meleeWoundRoll: UInt32.from(unit.meleeWoundRoll),
        meleeDamage: UInt32.from(unit.meleeDamage),
      })
    });

    const snarkyPosition = Position.fromXY(gamePiece.positionX, gamePiece.positionY);
    const gamePieceNumber = await gamePiece.gamePieceNumber();
    const snarkyPiece = new Piece(
      Field(gamePieceNumber),
      PublicKey.fromBase58(player.minaPublicKey),
      snarkyPosition,
      snarkyUnit,
    );

    piecesTree.set(snarkyPiece.id.toBigInt(), snarkyPiece.hash());
  });

  return piecesTree;
}