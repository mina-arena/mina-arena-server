import * as Models from '../../src/models';
import { randomString } from '../../src/graphql/helpers';

export default async function createUnit(): Promise<Models.Unit> {
  return await Models.Unit.create({
    name: `Test Unit ${randomString(12)}`,
    maxHealth: 3,
    movementSpeed: 10,
    armorSaveRoll: 4,
    pointsCost: 10,
    meleeNumAttacks: 3,
    meleeHitRoll: 3,
    meleeWoundRoll: 4,
    meleeArmorPiercing: 0,
    meleeDamage: 1
  });
}