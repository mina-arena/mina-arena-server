import * as Models from '../../../src/models';
import * as Factories from '../../factories';
import serializeArenaTree from '../../../src/service_objects/mina/arena_tree_serializer';
import { ArenaMerkleTree, Position } from 'mina-arena-contracts';
import { Field } from 'snarkyjs';

describe('Arena Tree Serlializer', () => {
  let game: Models.Game;
  let somePlayer: Models.Player;
  let somePlayerUnit: Models.PlayerUnit;
  let someGamePlayer: Models.GamePlayer;
  let gamePieces: Models.GamePiece[];
  let positions: number[][];

  beforeEach(async () => {
    await Factories.cleanup();

    positions = [
      [10, 10],
      [50, 10],
      [100, 10],
    ]

    // Populate a game
    // Using only a single player since serializing the arena is independent of players
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
      rangedAmmo: 5
    });
    somePlayer = await Factories.createPlayer();
    somePlayerUnit = await Factories.createPlayerUnit(somePlayer, someUnit);
    someGamePlayer = await Factories.createGamePlayer(game, somePlayer);
    gamePieces = [];
    positions.forEach(async (position) => {
      const piece = await Factories.createGamePiece(
        someGamePlayer,
        somePlayerUnit,
        position[0],
        position[1]
      );

      gamePieces.push(piece);
    });
  });

  afterEach(async () => {
    await Factories.cleanup();
  });

  it('serializes the correct merkle tree', async () => {
    const expectedTree = new ArenaMerkleTree();
    positions.forEach((position) => {
      expectedTree.set(position[0], position[1], Field(1));
    });

    const serializedTree = await serializeArenaTree(game.id);

    expect(serializedTree.tree.getRoot().toString()).toEqual(expectedTree.tree.getRoot().toString());
  });
});