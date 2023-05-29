export {};
/**
 * Given a Game ID, find all of the Game Pieces and serialize them into a PiecesMerkleTree
 */
// export default async function serializePiecesTree(gameId: string | number, transaction?: Transaction): Promise<PiecesMerkleTree> {
//   const game = await Models.Game.findByPk(gameId, { transaction });
//   if (game.status != 'inProgress') throw new Error(`Game ${game.id} is not in progress, status: ${game.status}`);
//   const gamePieces = await Models.GamePiece.findAll({
//     where: { gameId },
//     include: [
//       {
//         model: Models.GamePlayer,
//         as: 'gamePlayer',
//       },
//       {
//         model: Models.PlayerUnit,
//         as: 'playerUnit',
//         include: [
//           {
//             model: Models.Unit,
//             as: 'unit',
//           }
//         ]
//       }
//     ],
//   });
//   const piecesTree = new PiecesMerkleTree();
//   gamePieces.forEach((gamePiece) => {
//     const snarkyUnit = new Unit({
//       stats: new UnitStats({
//         health: UInt32.from(gamePiece.health),
//         movement: UInt32.from(gamePiece.playerUnit.unit.movementSpeed), // TODO: How does this work?  Currently getting `Property 'unit' does not exist on type '() => Promise<PlayerUnit>'`
//         rangedAttackRange: UInt32.from(gamePiece.playerUnit.unit.rangedAttackRange),
//         rangedHitRoll: UInt32.from(gamePiece.playerUnit.unit.rangedHitRoll),
//         rangedWoundRoll: UInt32.from(gamePiece.playerUnit.unit.rangedWoundRoll),
//         saveRoll: UInt32.from(gamePiece.playerUnit.unit.saveRoll),
//         rangedDamage: UInt32.from(gamePiece.playerUnit.unit.rangedDamage),
//         meleeHitRoll: UInt32.from(gamePiece.playerUnit.unit.meleeHitRoll),
//         meleeWoundRoll: UInt32.from(gamePiece.playerUnit.unit.meleeWoundRoll),
//         meleeDamage: UInt32.from(gamePiece.playerUnit.unit.meleeDamage),
//       })
//     });
//     const snarkyPosition = Position.fromXY(gamePiece.positionX, gamePiece.positionY);
//     const snarkyPiece = new Piece(
//       Field(gamePiece.id), // TODO: We need access to an "id" per game per piece, such that each piece has a 1-16 value
//       gamePiece.gamePlayer.publicKey, // TODO: We need access to the player's public key
//       snarkyPosition,
//       snarkyUnit,
//     );
//     piecesTree.set(snarkyPiece.id.toBigInt(), snarkyPiece.hash());
//   });
//   return piecesTree;
// }
//# sourceMappingURL=pieces_tree_serializer.js.map