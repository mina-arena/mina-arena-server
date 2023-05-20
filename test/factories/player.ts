import * as Models from '../../src/models';
import { randomString } from '../../src/graphql/helpers';

export default async function createPlayer(): Promise<Models.Player> {
  return await Models.Player.create({
    name: 'John Smith',
    minaPublicKey: randomString(32)
  });
}
