import {
  Encryption,
  Group,
  Field,
  PrivateKey,
  Signature,
  PublicKey,
} from 'snarkyjs';
import { EncryptedDiceRolls } from '../../models/game_piece_action';
import newrelic from 'newrelic';
import dotenv from 'dotenv';

dotenv.config();

// decrpyt a dice roll
export const decryptRoll = (roll: EncryptedDiceRolls): number => {
  const rngPublicKey = PublicKey.fromBase58(process.env.RNG_PUBLIC_KEY);
  const signature = Signature.fromJSON(roll.signature);
  const cipherText = roll.cipherText
    .split(',')
    .map((element) => Field(element));

  // verifies that the known RNG provider signed a message containing
  // 1 | 6 | cipherText
  // Where 1 is the number of dice rolled and 6 is the number of sides on the dice
  const signatureIsValid = signature
    .verify(rngPublicKey, [Field(1), Field(6), ...cipherText])
    .toBoolean();

  if (!signatureIsValid) {
    throw 'Invalid Signature';
  }

  if (cipherText.length !== 2) {
    // This should never happen - it means the signature lied about the length of the content
    throw 'Ciphertext must be of length 2';
  }

  const publicKey = Group.fromJSON(roll.publicKey);
  const ct = {
    publicKey,
    cipherText,
  };
  const serverPrivateKey = PrivateKey.fromBase58(
    process.env.SERVER_PRIVATE_KEY
  );
  const decrypted = Encryption.decrypt(ct, serverPrivateKey);
  newrelic.recordCustomEvent('DiceRollDecryption', {
    ciphertext: roll.cipherText,
    decrypted: decrypted[0].toString(),
  });
  return Number(decrypted[0].toString());
};
