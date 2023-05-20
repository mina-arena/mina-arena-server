import * as Models from '../../src/models';

export default async function createPlayerUnit(
  player: Models.Player,
  unit: Models.Unit
): Promise<Models.PlayerUnit> {
  return await Models.PlayerUnit.create({
    name: 'Test PlayerUnit',
    playerId: player.id,
    unitId: unit.id
  });
}