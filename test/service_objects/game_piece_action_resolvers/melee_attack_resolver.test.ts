import { jest } from '@jest/globals';
import * as Models from '../../../src/models';
import * as Factories from '../../factories';
import resolveMeleeAttackAction, {
  validateMeleeAttackAction,
} from '../../../src/service_objects/game_piece_action_resolvers/melee_attack_resolver';
import * as AttackResolver from '../../../src/service_objects/game_piece_action_resolvers/attack_resolver';
import { MELEE_ATTACK_RANGE } from 'mina-arena-contracts';

describe('validateMeleeAttackAction', () => {
  let attackingGamePiece: Models.GamePiece;
  let targetGamePiece: Models.GamePiece;

  beforeEach(async () => {
    await Factories.cleanup();

    let game = await Factories.createGame();

    let attackingUnit = await Models.Unit.create({
      name: 'Berserker',
      maxHealth: 6,
      movementSpeed: 150,
      armorSaveRoll: 6,
      pointsCost: 20,
      meleeNumAttacks: 3,
      meleeHitRoll: 2,
      meleeWoundRoll: 3,
      meleeArmorPiercing: 1,
      meleeDamage: 1,
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
    let distance =
      attackingGamePiece.coordinates().y + (MELEE_ATTACK_RANGE - 1);
    targetGamePiece = await Factories.createGamePiece(
      targetGamePlayer,
      targetPlayerUnit,
      10,
      distance
    );
  });

  afterAll(async () => {
    await Factories.cleanup();
  });

  describe('with valid input', () => {
    it('returns analyzed data', async () => {
      let result = await validateMeleeAttackAction(
        attackingGamePiece,
        targetGamePiece.id,
        false
      );
      expect(result.distanceToTarget).toBe(MELEE_ATTACK_RANGE - 1);
    });
  });

  describe('with a unit out of range', () => {
    it('throws error', async () => {
      await targetGamePiece.update({ positionX: 1000, positionY: 1000 });
      try {
        await validateMeleeAttackAction(
          attackingGamePiece,
          targetGamePiece.id,
          false
        );
        // Expect the above to throw error, should fail if not
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toContain(
          'cannot execute a melee attack against target GamePiece'
        );
        expect(e.message).toContain('is greater than melee range');
      }
    });
  });
});

describe('resolveMeleeAttackAction', () => {
  let action: Models.GamePieceAction;
  let targetGamePiece: Models.GamePiece;
  let targetUnit: Models.Unit;
  let attackingUnit: Models.Unit;

  beforeEach(async () => {
    await Factories.cleanup();

    let game = await Factories.createGame();

    let attackingUnit = await Models.Unit.create({
      name: 'Berserker',
      maxHealth: 6,
      movementSpeed: 150,
      armorSaveRoll: 6,
      pointsCost: 20,
      meleeNumAttacks: 3,
      meleeHitRoll: 2,
      meleeWoundRoll: 3,
      meleeArmorPiercing: 1,
      meleeDamage: 1,
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
    let distance =
      attackingGamePiece.coordinates().y + (MELEE_ATTACK_RANGE - 1);
    targetGamePiece = await Factories.createGamePiece(
      targetGamePlayer,
      targetPlayerUnit,
      10,
      distance
    );

    let gamePhase = await Models.GamePhase.create({
      gameId: game.id,
      gamePlayerId: attackingGamePlayer.id,
      turnNumber: 1,
      phase: 'melee',
    });

    action = await Models.GamePieceAction.create({
      gamePhaseId: gamePhase.id,
      gamePlayerId: attackingGamePlayer.id,
      gamePieceId: attackingGamePiece.id,
      actionType: 'meleeAttack',
      actionData: {
        actionType: 'meleeAttack',
        resolved: false,
        targetGamePieceId: targetGamePiece.id,
        encodedDiceRolls: {
          publicKey: { x: 'xValue', y: 'yValue' },
          cipherText: 'supersecret',
          signature: { r: 'rValue', s: 'sValue' },
        },
        resolvedAttacks: undefined,
      },
    });
  });

  afterAll(async () => {
    await Factories.cleanup();
  });

  describe.skip('with a valid action', () => {
    beforeEach(async () => {
      // Mock attack resolution
      let mockResolvedAttackOne = {
        hitRoll: {
          roll: 6,
          rollNeeded: attackingUnit.meleeHitRoll,
          success: true
        },
        woundRoll: {
          roll: 6,
          rollNeeded: attackingUnit.meleeWoundRoll,
          success: true
        },
        saveRoll: {
          roll: 1,
          rollNeeded: targetUnit.armorSaveRoll - attackingUnit.meleeArmorPiercing,
          success: false
        },
        damageDealt: 1,
        averageDamage: 0.2,
      };
      let mockResolvedAttackTwo = {
        hitRoll: {
          roll: 1,
          rollNeeded: attackingUnit.meleeHitRoll,
          success: false
        },
        woundRoll: {
          roll: 6,
          rollNeeded: attackingUnit.meleeWoundRoll,
          success: true
        },
        saveRoll: {
          roll: 1,
          rollNeeded: targetUnit.armorSaveRoll - attackingUnit.meleeArmorPiercing,
          success: false
        },
        damageDealt: 0,
        averageDamage: 0.2,
      };
      let mockResolvedAttackThree = {
        hitRoll: {
          roll: 6,
          rollNeeded: attackingUnit.meleeHitRoll,
          success: true
        },
        woundRoll: {
          roll: 1,
          rollNeeded: attackingUnit.meleeWoundRoll,
          success: false
        },
        saveRoll: {
          roll: 1,
          rollNeeded: targetUnit.armorSaveRoll - attackingUnit.meleeArmorPiercing,
          success: false
        },
        damageDealt: 0,
        averageDamage: 0.2,
      };
      jest
        .spyOn(AttackResolver, 'default')
        .mockImplementation(() => [
          mockResolvedAttackOne,
          mockResolvedAttackTwo,
          mockResolvedAttackThree,
        ]);
    });

    it('resolves action and modifies state', async () => {
      await targetGamePiece.reload();
      expect(targetGamePiece.health).toBe(3);

      await resolveMeleeAttackAction(action);

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
      expect(savedResolvedAttacks[1].hitRoll.roll).toBe(1);
      expect(savedResolvedAttacks[1].hitRoll.success).toBe(false);
      expect(savedResolvedAttacks[1].woundRoll.roll).toBe(6);
      expect(savedResolvedAttacks[1].woundRoll.success).toBe(true);
      expect(savedResolvedAttacks[1].saveRoll.roll).toBe(1);
      expect(savedResolvedAttacks[1].saveRoll.success).toBe(false);
      expect(savedResolvedAttacks[1].damageDealt).toBe(0);
      expect(savedResolvedAttacks[2].hitRoll.roll).toBe(6);
      expect(savedResolvedAttacks[2].hitRoll.success).toBe(true);
      expect(savedResolvedAttacks[2].woundRoll.roll).toBe(1);
      expect(savedResolvedAttacks[2].woundRoll.success).toBe(false);
      expect(savedResolvedAttacks[2].saveRoll.roll).toBe(1);
      expect(savedResolvedAttacks[2].saveRoll.success).toBe(false);
      expect(savedResolvedAttacks[2].damageDealt).toBe(0);

      expect(action.actionData['totalDamageDealt']).toBe(1);

      // Check targetGamePiece new health
      await targetGamePiece.reload();
      expect(targetGamePiece.health).toBe(2);
    });
  });

  describe('with a unit out of range', () => {
    it('throws error', async () => {
      await targetGamePiece.update({ positionX: 1000, positionY: 1000 });
      try {
        await resolveMeleeAttackAction(action);
        // Expect the above to throw error, should fail if not
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toContain(
          'cannot execute a melee attack against target GamePiece'
        );
        expect(e.message).toContain('is greater than melee range');
      }
    });
  });
});
