import * as Models from '../../../src/models';
import * as Factories from '../../factories';
import serializePiecesTree from '../../../src/service_objects/mina/pieces_tree_serializer';
import {
  PiecesMerkleTree,
  Piece,
  Position,
  Unit,
  UnitStats,
} from 'mina-arena-contracts';
import { Field, PublicKey, UInt32 } from 'snarkyjs';

describe('Pieces Tree Serlializer', () => {
  let game: Models.Game;
  let somePlayer: Models.Player;
  let somePlayerUnit: Models.PlayerUnit;
  let someGamePlayer: Models.GamePlayer;
  let gamePieces: Models.GamePiece[];
  let positions: number[][];

  beforeEach(async () => {
    await Factories.cleanup();

    // Can only use one position for now, since creating multiple game pieces ends up using the same id
    positions = [[10, 10]];

    // Populate a game
    // Using only a single player since serializing the pieces is independent of players
    game = await Factories.createGame();
    let someUnit = await Models.Unit.create({
      name: 'Archer',
      maxHealth: 2,
      movementSpeed: 10,
      armorSaveRoll: 6,
      pointsCost: 10,
      meleeNumAttacks: 1,
      meleeHitRoll: 4,
      meleeWoundRoll: 5,
      meleeArmorPiercing: 0,
      meleeDamage: 1,
      rangedNumAttacks: 3,
      rangedRange: 100,
      rangedHitRoll: 3,
      rangedWoundRoll: 4,
      rangedArmorPiercing: 1,
      rangedDamage: 1,
      rangedAmmo: 5,
    });
    somePlayer = await Factories.createPlayer();
    somePlayerUnit = await Factories.createPlayerUnit(somePlayer, someUnit);
    someGamePlayer = await Factories.createGamePlayer(game, somePlayer);
    gamePieces = [];
    for (const position of positions) {
      const piece = await Factories.createGamePiece(
        someGamePlayer,
        somePlayerUnit,
        position[0],
        position[1]
      );

      gamePieces.push(piece);
    }
  });

  afterEach(async () => {
    await Factories.cleanup();
  });

  it('serializes the correct merkle tree', async () => {
    const expectedTree = new PiecesMerkleTree();
    for (const gamePiece of gamePieces) {
      const gamePieceNumber = await gamePiece.gamePieceNumber();
      const playerUnit = await gamePiece.playerUnit();
      const unit = await playerUnit.unit();
      const gamePlayer = await gamePiece.gamePlayer();
      const player = await gamePlayer.player();

      const snarkyUnit = unit.toSnarkyUnit();
      const snarkyPiece = new Piece({
        id: Field(gamePieceNumber),
        playerPublicKey: PublicKey.fromBase58(player.minaPublicKey),
        position: Position.fromXY(gamePiece.positionX, gamePiece.positionY),
        baseUnit: snarkyUnit,
        condition: snarkyUnit.stats,
      });

      expectedTree.set(BigInt(gamePieceNumber), snarkyPiece.hash());
    }

    const serializedTree = await serializePiecesTree(game.id);

    expect(serializedTree.tree.getRoot().toString()).toEqual(
      expectedTree.tree.getRoot().toString()
    );
  });
});
