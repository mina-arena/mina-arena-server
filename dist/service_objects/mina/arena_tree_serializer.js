import { Field } from 'snarkyjs';
import { ArenaMerkleTree } from 'mina-arena-contracts';
import * as Models from '../../models/index.js';
/**
 * Given a Game ID, find all the GamePieces that are in the game and serialize them into an ArenaMerkleTree
 */
export default async function serializeArenaTree(gameId, transaction) {
    const game = await Models.Game.findByPk(gameId, { transaction });
    if (game.status != 'inProgress')
        throw new Error(`Game ${game.id} is not in progress, status: ${game.status}`);
    const gamePieces = await Models.GamePiece.findAll({
        where: { gameId }
    });
    const arenaTree = new ArenaMerkleTree();
    gamePieces.forEach((gamePiece) => {
        const x = gamePiece.positionX;
        const y = gamePiece.positionY;
        arenaTree.set(x, y, Field(1));
    });
    return arenaTree;
}
;
//# sourceMappingURL=arena_tree_serializer.js.map