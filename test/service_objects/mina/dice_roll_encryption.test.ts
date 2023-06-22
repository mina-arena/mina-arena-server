import { decryptRoll } from '../../../src/service_objects/mina/dice_roll_encryption';
import { Field, PrivateKey, Encryption, Signature } from 'snarkyjs';
import { EncryptedDiceRolls } from '../../../src/models/game_piece_action';
import dotenv from 'dotenv';

dotenv.config();

describe('Dice Roll Decryption', () => {
  const serverPrivateKey = PrivateKey.fromBase58(
    process.env.SERVER_PRIVATE_KEY as string
  );
  const rngPrivateKey = PrivateKey.fromBase58(
    process.env.RNG_PRIVATE_KEY as string
  );
  describe('roll one die', () => {
    const encryption = Encryption.encrypt(
      [Field(2)],
      serverPrivateKey.toPublicKey()
    );
    const sig = Signature.create(rngPrivateKey, [
      Field(1),
      Field(6),
      ...encryption.cipherText,
    ]);
    const encryptedRoll: EncryptedDiceRolls = {
      publicKey: encryption.publicKey.toJSON(),
      cipherText: encryption.cipherText.toString(),
      signature: sig.toJSON(),
    };

    it('decrypts the roll', async () => {
      const decrypted = decryptRoll(encryptedRoll);

      expect(decrypted).toEqual(2);
    });
  });
  describe('roll two dice', () => {
    const encryption = Encryption.encrypt(
      [Field(2), Field(3)],
      serverPrivateKey.toPublicKey()
    );
    const sig = Signature.create(rngPrivateKey, [
      Field(2),
      Field(6),
      ...encryption.cipherText,
    ]);
    const encryptedRoll: EncryptedDiceRolls = {
      publicKey: encryption.publicKey.toJSON(),
      cipherText: encryption.cipherText.toString(),
      signature: sig.toJSON(),
    };

    it('Throws an error', async () => {
      expect(() => decryptRoll(encryptedRoll)).toThrow('Invalid Signature');
    });
  });
});
