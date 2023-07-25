import * as Models from '../../../src/models';
import * as Factories from '../../factories';
import resolveMoveAction, {
  validateMoveAction,
} from '../../../src/service_objects/game_piece_action_resolvers/move_resolver';
import { PrivateKey, Field } from 'snarkyjs';
import { Action, Position } from 'mina-arena-contracts';

describe('validateMoveAction', () => {
  let movingGamePiece: Models.GamePiece;
  let enemyGamePiece: Models.GamePiece;

  let p1PrivateKey;
  let p2PrivateKey;

  beforeEach(async () => {
    await Factories.cleanup();

    p1PrivateKey = PrivateKey.random();
    p2PrivateKey = PrivateKey.random();

    let game = await Factories.createGame();

    let movingUnit = await Models.Unit.create({
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

    let enemyUnit = await Factories.createUnit();
    let movingPlayer = await Factories.createPlayer(p1PrivateKey.toPublicKey());
    let enemyPlayer = await Factories.createPlayer(p2PrivateKey.toPublicKey());
    let movingPlayerUnit = await Factories.createPlayerUnit(
      movingPlayer,
      movingUnit
    );
    let enemyPlayerUnit = await Factories.createPlayerUnit(
      enemyPlayer,
      enemyUnit
    );
    let movingGamePlayer = await Factories.createGamePlayer(game, movingPlayer);
    let enemyGamePlayer = await Factories.createGamePlayer(game, enemyPlayer);

    movingGamePiece = await Factories.createGamePiece(
      movingGamePlayer,
      movingPlayerUnit,
      10,
      10
    );
    enemyGamePiece = await Factories.createGamePiece(
      enemyGamePlayer,
      enemyPlayerUnit,
      10,
      15
    );
  });

  afterAll(async () => {
    await Factories.cleanup();
  });

  describe('with valid input', () => {
    it('returns analyzed data', async () => {
      let currentPos = movingGamePiece.coordinates();
      let result = await validateMoveAction(
        movingGamePiece,
        { x: currentPos.x, y: currentPos.y },
        { x: currentPos.x + 5, y: currentPos.y }
      );
      expect(result.distance).toBe(5);
    });
  });

  describe('trying to move beyond max range', () => {
    it('throws error', async () => {
      try {
        let currentPos = movingGamePiece.coordinates();
        await validateMoveAction(
          movingGamePiece,
          { x: currentPos.x, y: currentPos.y },
          { x: currentPos.x + 1000, y: currentPos.y }
        );
        // Expect the above to throw error, should fail if not
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toContain('cannot be moved');
        expect(e.message).toContain('because the distance is');
      }
    });
  });

  describe('trying to move on top of other piece', () => {
    it('throws error', async () => {
      try {
        let currentPos = movingGamePiece.coordinates();
        let enemyPiecePos = enemyGamePiece.coordinates();
        await validateMoveAction(
          movingGamePiece,
          { x: currentPos.x, y: currentPos.y },
          { x: enemyPiecePos.x, y: enemyPiecePos.y }
        );
        // Expect the above to throw error, should fail if not
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toContain('cannot be moved');
        expect(e.message).toContain('because this collides');
      }
    });
  });
});

describe('resolveMoveAction', () => {
  let action: Models.GamePieceAction;
  let movingGamePiece: Models.GamePiece;
  let enemyGamePiece: Models.GamePiece;

  let p1PrivateKey;
  let p2PrivateKey;

  beforeEach(async () => {
    await Factories.cleanup();

    p1PrivateKey = PrivateKey.random();
    p2PrivateKey = PrivateKey.random();

    let game = await Factories.createGame();

    let movingUnit = await Models.Unit.create({
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

    let enemyUnit = await Factories.createUnit();
    let movingPlayer = await Factories.createPlayer(p1PrivateKey.toPublicKey());
    let enemyPlayer = await Factories.createPlayer(p2PrivateKey.toPublicKey());
    let movingPlayerUnit = await Factories.createPlayerUnit(
      movingPlayer,
      movingUnit
    );
    let enemyPlayerUnit = await Factories.createPlayerUnit(
      enemyPlayer,
      enemyUnit
    );
    let movingGamePlayer = await Factories.createGamePlayer(game, movingPlayer);
    let enemyGamePlayer = await Factories.createGamePlayer(game, enemyPlayer);

    movingGamePiece = await Factories.createGamePiece(
      movingGamePlayer,
      movingPlayerUnit,
      10,
      10
    );
    enemyGamePiece = await Factories.createGamePiece(
      enemyGamePlayer,
      enemyPlayerUnit,
      10,
      15
    );

    let gamePhase = await Models.GamePhase.create({
      gameId: game.id,
      gamePlayerId: movingGamePlayer.id,
      turnNumber: 1,
      phase: 'movement',
    });

    let currentPos = movingGamePiece.coordinates();

    const snarkyAction = new Action({
      nonce: Field(1),
      actionType: Field(0),
      actionParams: Position.fromXY(currentPos.x + 5, currentPos.y).hash(),
      piece: Field(await movingGamePiece.gamePieceNumber()),
    });
    const signature = snarkyAction.sign(p1PrivateKey);

    action = await Models.GamePieceAction.create({
      gamePhaseId: gamePhase.id,
      gamePlayerId: movingGamePlayer.id,
      gamePieceId: movingGamePiece.id,
      actionType: 'move',
      actionData: {
        actionType: 'move',
        resolved: false,
        moveFrom: { x: currentPos.x, y: currentPos.y },
        moveTo: { x: currentPos.x + 5, y: currentPos.y },
        gamePieceNumber: await movingGamePiece.gamePieceNumber(),
        nonce: 1,
      },
      signature: signature.toJSON(),
    });
  });

  afterAll(async () => {
    await Factories.cleanup();
  });

  describe('with a valid action', () => {
    it('resolves action and modifies state', async () => {
      await movingGamePiece.reload();
      let prevPos = movingGamePiece.coordinates();

      await resolveMoveAction(action);

      // Check action to now be resolved with saved results
      await action.reload();
      expect(action.actionData['resolved']).toBe(true);

      // Check targetGamePiece new health
      await movingGamePiece.reload();
      let newPos = movingGamePiece.coordinates();
      expect(newPos.x).toBe(prevPos.x + 5);
      expect(newPos.y).toBe(prevPos.y);
    });
  });

  describe('trying to move beyond max range', () => {
    it('throws error', async () => {
      let newActionData = JSON.parse(JSON.stringify(action.actionData));
      newActionData.moveTo = {
        x: movingGamePiece.coordinates().x + 1000,
        y: movingGamePiece.coordinates().y,
      };
      action.actionData = newActionData;
      await action.save();

      try {
        await resolveMoveAction(action);
        // Expect the above to throw error, should fail if not
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toContain('cannot be moved');
        expect(e.message).toContain('because the distance is');
      }
    });
  });
});
