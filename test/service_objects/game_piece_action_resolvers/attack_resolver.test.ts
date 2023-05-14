import 'jest';
import resolveAttack from '../../../src/service_objects/game_piece_action_resolvers/attack_resolver';
// import { Unit } from '../../../src/models';
import { EncodedDiceRolls } from '../../../src/models/game_piece_action.js';

describe('resolveAttack', () => {
  let numAttacks: number;
  let attackerHitRollStat: number;
  let attackerWoundRollStat: number;
  let targetSaveRollStat: number;
  let attackerArmorPiercingStat: number;
  let attackerDamageStat: number;
  let encodedDiceRolls: EncodedDiceRolls;

  beforeEach(async () => {
    numAttacks = 100;
    attackerHitRollStat = 3;
    attackerWoundRollStat = 4;
    targetSaveRollStat = 3;
    attackerArmorPiercingStat = 1;
    attackerDamageStat = 1;

    // Clear all units before test
    // await Unit.destroy({where: {}});

    // attackingUnit = await Unit.create({
    //   id: 1,
    //   name: 'Archer',
    //   maxHealth: 2,
    //   movementSpeed: 10,
    //   armorSaveRoll: 6,
    //   pointsCost: 10,
    //   meleeNumAttacks: 1,
    //   meleeHitRoll: 4,
    //   meleeWoundRoll: 5,
    //   meleeArmorPiercing: 0,
    //   meleeDamage: 1,
    //   rangedNumAttacks: 3,
    //   rangedHitRoll: 3,
    //   rangedWoundRoll: 4,
    //   rangedArmorPiercing: 1,
    //   rangedDamage: 1,
    //   rangedAmmo: 5,
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // });

    // targetUnit = await Unit.create({
    //   id: 2,
    //   name: 'Swordsman',
    //   maxHealth: 4,
    //   movementSpeed: 10,
    //   armorSaveRoll: 5,
    //   pointsCost: 10,
    //   meleeNumAttacks: 3,
    //   meleeHitRoll: 3,
    //   meleeWoundRoll: 3,
    //   meleeArmorPiercing: 1,
    //   meleeDamage: 2,
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // });

    encodedDiceRolls = {
      publicKey: { x: 'xValue', y: 'yValue' },
      cipherText: 'secret',
      signature: { r: 'rValue', s: 'sValue' }
    };
  });

  // afterAll(async () => {
  //   await Unit.destroy({where: {}});
  // });

  it('resolves attack sequences correctly', async () => {
    const resolvedAttacks = resolveAttack(
      numAttacks,
      attackerHitRollStat,
      attackerWoundRollStat,
      targetSaveRollStat,
      attackerArmorPiercingStat,
      attackerDamageStat,
      encodedDiceRolls
    );
    expect(resolvedAttacks.length).toBe(numAttacks);
    resolvedAttacks.forEach(resolvedAttack => {
      if (resolvedAttack.hitRoll.roll >= attackerHitRollStat) {
        expect(resolvedAttack.hitRoll.success).toBe(true);
      } else {
        expect(resolvedAttack.hitRoll.success).toBe(false);
        expect(resolvedAttack.damageDealt).toBe(0);
      }
      if (resolvedAttack.woundRoll.roll >= attackerWoundRollStat) {
        expect(resolvedAttack.woundRoll.success).toBe(true);
      } else {
        expect(resolvedAttack.woundRoll.success).toBe(false);
        expect(resolvedAttack.damageDealt).toBe(0);
      }
      if (resolvedAttack.saveRoll.roll >= (targetSaveRollStat + attackerArmorPiercingStat)) {
        expect(resolvedAttack.saveRoll.success).toBe(true);
        expect(resolvedAttack.damageDealt).toBe(0);
      } else {
        expect(resolvedAttack.saveRoll.success).toBe(false);
      }
      if (
        resolvedAttack.hitRoll.success &&
        resolvedAttack.woundRoll.success &&
        !resolvedAttack.saveRoll.success
      ) {
        expect(resolvedAttack.damageDealt).toBe(attackerDamageStat);
      }
    });
  });

    // beforeEach(() => {
    //     instance = new Environment('local');
    // });

    // it('should get the current environment', async () => {
    //     expect(instance).toBeInstanceOf(Environment);
    //     const environment = instance.currentEnvironment();
    //     expect(environment).toBeDefined();
    //     expect(environment).toBe(Environments.LOCAL);
    // });

    // it('should check if environement is production or not', async () => {
    //     const result = instance.isProduction();
    //     expect(result).toBe(false);
    // });

    // it('should check if environement is production or not', async () => {
    //     const result = instance.isProduction();
    //     expect(result).toBe(false);
    // });

    // it('should set the current environment', async () => {
    //     instance.setEnvironment('local');
    //     const environment = instance.currentEnvironment();
    //     expect(environment).toBeDefined();
    //     expect(environment).toBe(Environments.LOCAL);
    // });
});