import * as Models from '../../src/models';

export default async function createGame(): Promise<Models.Game> {
  return await Models.Game.create({
    status: 'inProgress'
  });
}