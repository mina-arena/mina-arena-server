import * as Models from '../../src/models';
import { PrivateKey, PublicKey } from 'snarkyjs';

export default async function createPlayer(
  minaPublicKey?: PublicKey
): Promise<Models.Player> {
  return await Models.Player.create({
    name: 'John Smith',
    minaPublicKey: (
      minaPublicKey || PrivateKey.random().toPublicKey()
    ).toBase58(),
  });
}
