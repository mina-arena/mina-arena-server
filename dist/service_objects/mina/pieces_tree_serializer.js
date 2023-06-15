import { PiecesMerkleTree, } from 'mina-arena-contracts';
import * as Models from '../../models/index.js';
/**
 * Given a Game ID, find all of the Game Pieces and serialize them into a PiecesMerkleTree
 */
export default async function serializePiecesTree(gameId, transaction) {
    const game = await Models.Game.findByPk(gameId, { transaction });
    if (game.status != 'inProgress')
        throw new Error(`Game ${game.id} is not in progress, status: ${game.status}`);
    const gamePieces = await Models.GamePiece.findAll({
        where: { gameId },
    });
    const piecesTree = new PiecesMerkleTree();
    gamePieces.forEach(async (gamePiece) => {
        console.log('setting game piece');
        const snarkyPiece = await gamePiece.toSnarkyPiece();
        piecesTree.set(snarkyPiece.id.toBigInt(), snarkyPiece.hash());
    });
    return piecesTree;
}
//# sourceMappingURL=pieces_tree_serializer.js.map