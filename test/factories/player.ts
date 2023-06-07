import * as Models from '../../src/models';
import { PrivateKey } from 'snarkyjs';

export default async function createPlayer(): Promise<Models.Player> {
  return await Models.Player.create({
    name: 'John Smith',
    minaPublicKey: PrivateKey.random().toPublicKey().toBase58()
  });
}
