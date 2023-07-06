import * as Models from '../../../src/models';
import * as Factories from '../../factories';
import resolveRangedAttackAction, {
  validateRangedAttackAction,
} from '../../../src/service_objects/game_piece_action_resolvers/ranged_attack_resolver';
import * as AttackResolver from '../../../src/service_objects/game_piece_action_resolvers/attack_resolver';
import { roll_6_6_1 } from '../../support/dice_rolls';

describe('validateRangedAttackAction', () => {
  let attackingGamePiece: Models.GamePiece;
  let targetGamePiece: Models.GamePiece;

  beforeEach(async () => {
    await Factories.cleanup();

    let game = await Factories.createGame();

    let attackingUnit = await Models.Unit.create({
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

    let targetUnit = await Factories.createUnit();
    let attackingPlayer = await Factories.createPlayer();
    let targetPlayer = await Factories.createPlayer();
    let attackingPlayerUnit = await Factories.createPlayerUnit(
      attackingPlayer,
      attackingUnit
    );
    let targetPlayerUnit = await Factories.createPlayerUnit(
      targetPlayer,
      targetUnit
    );
    let attackingGamePlayer = await Factories.createGamePlayer(
      game,
      attackingPlayer
    );
    let targetGamePlayer = await Factories.createGamePlayer(game, targetPlayer);

    attackingGamePiece = await Factories.createGamePiece(
      attackingGamePlayer,
      attackingPlayerUnit,
      10,
      10
    );
    targetGamePiece = await Factories.createGamePiece(
      targetGamePlayer,
      targetPlayerUnit,
      10,
      15
    );
  });

  afterAll(async () => {
    await Factories.cleanup();
  });

  describe('with valid input', () => {
    it('returns analyzed data', async () => {
      let result = await validateRangedAttackAction(
        attackingGamePiece,
        targetGamePiece.id,
        false
      );
      expect(result.distanceToTarget).toBe(5);
    });
  });

  describe('with a unit out of range', () => {
    it('throws error', async () => {
      await targetGamePiece.update({ positionX: 1000, positionY: 1000 });
      try {
        await validateRangedAttackAction(
          attackingGamePiece,
          targetGamePiece.id,
          false
        );
        // Expect the above to throw error, should fail if not
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toContain(
          'cannot execute a ranged attack against target GamePiece'
        );
        expect(e.message).toContain("is greater than attacker's max range");
      }
    });
  });
});

describe('resolveRangedAttackAction', () => {
  let action: Models.GamePieceAction;
  let attackingUnit: Models.Unit;
  let targetUnit: Models.Unit;
  let targetGamePiece: Models.GamePiece;

  beforeEach(async () => {
    await Factories.cleanup();

    let game = await Factories.createGame();

    let attackingUnit = await Models.Unit.create({
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

    targetUnit = await Factories.createUnit();
    let attackingPlayer = await Factories.createPlayer();
    let targetPlayer = await Factories.createPlayer();
    let attackingPlayerUnit = await Factories.createPlayerUnit(
      attackingPlayer,
      attackingUnit
    );
    let targetPlayerUnit = await Factories.createPlayerUnit(
      targetPlayer,
      targetUnit
    );
    let attackingGamePlayer = await Factories.createGamePlayer(
      game,
      attackingPlayer
    );
    let targetGamePlayer = await Factories.createGamePlayer(game, targetPlayer);

    let attackingGamePiece = await Factories.createGamePiece(
      attackingGamePlayer,
      attackingPlayerUnit,
      10,
      10
    );
    targetGamePiece = await Factories.createGamePiece(
      targetGamePlayer,
      targetPlayerUnit,
      10,
      15
    );

    let gamePhase = await Models.GamePhase.create({
      gameId: game.id,
      gamePlayerId: attackingGamePlayer.id,
      turnNumber: 1,
      phase: 'shooting',
    });

    action = await Models.GamePieceAction.create({
      gamePhaseId: gamePhase.id,
      gamePlayerId: attackingGamePlayer.id,
      gamePieceId: attackingGamePiece.id,
      actionType: 'rangedAttack',
      actionData: {
        actionType: 'rangedAttack',
        resolved: false,
        targetGamePieceId: targetGamePiece.id,
        encryptedAttackRolls: [roll_6_6_1, roll_6_6_1, roll_6_6_1],
        resolvedAttacks: undefined,
      },
    });
  });

  afterAll(async () => {
    await Factories.cleanup();
  });

  describe('with a valid action', () => {
    it('resolves action and modifies state', async () => {
      await targetGamePiece.reload();
      expect(targetGamePiece.health).toBe(3);

      await resolveRangedAttackAction(action);

      // Check action to now be resolved with saved results
      await action.reload();
      expect(action.actionData['resolved']).toBe(true);
      let savedResolvedAttacks = action.actionData['resolvedAttacks'];
      expect(savedResolvedAttacks.length).toBe(3);
      expect(savedResolvedAttacks[0].hitRoll.roll).toBe(6);
      expect(savedResolvedAttacks[0].hitRoll.success).toBe(true);
      expect(savedResolvedAttacks[0].woundRoll.roll).toBe(6);
      expect(savedResolvedAttacks[0].woundRoll.success).toBe(true);
      expect(savedResolvedAttacks[0].saveRoll.roll).toBe(1);
      expect(savedResolvedAttacks[0].saveRoll.success).toBe(false);
      expect(savedResolvedAttacks[0].damageDealt).toBe(1);

      expect(action.actionData['totalDamageDealt']).toBe(3);

      // Check targetGamePiece new health
      await targetGamePiece.reload();
      expect(targetGamePiece.health).toBe(0);
    });
  });

  describe('with a unit out of range', () => {
    it('throws error', async () => {
      await targetGamePiece.update({ positionX: 10, positionY: 500 });
      try {
        await resolveRangedAttackAction(action);
        // Expect the above to throw error, should fail if not
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toContain(
          'cannot execute a ranged attack against target GamePiece'
        );
        expect(e.message).toContain("is greater than attacker's max range");
      }
    });
  });
});
