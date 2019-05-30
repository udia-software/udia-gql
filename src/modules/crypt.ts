/**
 * Helper functions wrapping tweetnacl API.
 */
import { pbkdf2 } from "pbkdf2";
import { box, hash, randomBytes, secretbox, sign } from "tweetnacl";

type Primative = string | number | boolean | null;
// tslint:disable-next-line: interface-name
interface SerializableArray extends ReadonlyArray<Serializable> { }
export type Serializable = Primative | Primative[] | SerializableArray;

export default class Crypt {
  /**
   * Generate the three required keys for UDIA auth & crypto
   * @param uname Username of user
   * @param uip User inputted password
   * @param nonce Random string created on user creation
   * @param cost Number of pbkdf2 iterations
   */
  public static async deriveMasterKeys(uname: string, uip: string, nonce: string, cost: number) {
    const luname = uname.normalize("NFKC").toLowerCase().trim();

    // Compute Salt
    const preSaltString = [luname, Crypt.NAME, Crypt.VERSION, cost, nonce].join(":");
    const preSaltBuffer = Buffer.from(preSaltString, "utf8");
    const uint8Salt = hash(preSaltBuffer);
    const salt = Buffer.from(uint8Salt);

    const keyBuf = await new Promise<Buffer>((resolve, reject) => {
      pbkdf2(uip, salt, cost, Crypt.KEYLEN, "sha512", (err, derivedKey) => {
        if (err) { reject(err); } else { resolve(derivedKey); }
      });
    });

    const pw = Buffer.from(keyBuf.subarray(0, keyBuf.length / 3)).toString("base64");
    const ek = Buffer.from(keyBuf.subarray(keyBuf.length / 3, 2 * keyBuf.length / 3)).toString("base64");
    const sk = Buffer.from(keyBuf.subarray(2 * keyBuf.length / 3, keyBuf.length)).toString("base64");

    return { pw, ek, sk };
  }

  /**
   * Symmetrically encrypt a serialzable payload using a secret key
   * @param payload Serializable value to encrypt
   * @param sk User derived secret key
   */
  public static symmetricEncrypt(payload: Serializable, sk: string) {
    const msgString = JSON.stringify(payload);
    const msg = Buffer.from(msgString, "utf8");
    const nonceBuffer = Buffer.from(randomBytes(secretbox.nonceLength));
    const key = Buffer.from(sk, "base64");
    const encBuffer = Buffer.from(secretbox(msg, nonceBuffer, key));
    const enc = encBuffer.toString("base64");
    const nonce = nonceBuffer.toString("base64");
    return { enc, nonce };
  }

  /**
   * Decrypt an encrypted message using a secret key
   * @param enc Message to decrypt
   * @param nonce Random crypographic one time value
   * @param sk User derived secret key
   */
  public static symmetricDecrypt(enc: string, nonce: string, sk: string): Serializable {
    const encBuffer = Buffer.from(enc, "base64");
    const nonceBuffer = Buffer.from(nonce, "base64");
    const key = Buffer.from(sk, "base64");
    const payloadBuffer = secretbox.open(encBuffer, nonceBuffer, key);
    if (payloadBuffer === null) {
      throw new Error("Unable to decrypt message.");
    }
    const rawPayload = Buffer.from(payloadBuffer).toString("utf8");
    return JSON.parse(rawPayload);
  }

  /**
   * Create a public key for the corresponding secret key
   * @param ek User derived secret encryption key
   */
  public static derivePublicEncryptionKey(ek: string) {
    const secretKey = Buffer.from(ek, "base64");
    const { publicKey } = box.keyPair.fromSecretKey(secretKey);
    const pubKey = Buffer.from(publicKey).toString("base64");
    return pubKey;
  }

  /**
   * Create a public and private asymmetric encryption key pair
   */
  public static generateEncryptionKeyPair() {
    const { publicKey: pubKeyBuffer, secretKey: secKeyBuffer } = box.keyPair();
    const pubKey = Buffer.from(pubKeyBuffer).toString("base64");
    const secKey = Buffer.from(secKeyBuffer).toString("base64");
    return {
      publicEncKey: pubKey,
      secretEncKey: secKey,
    };
  }

  /**
   * Asymmetrically encrypt a serialzable payload using a pub/sec key pair
   * @param payload Serializable value to encrypt
   * @param theirPublicEncKey Other user's public encryption key
   * @param mySecretEncKey My secret encryption key
   */
  public static asymmetricEncrypt(payload: Serializable, theirPublicEncKey: string, mySecretEncKey: string) {
    const msgString = JSON.stringify(payload);
    const msg = Buffer.from(msgString, "utf8");
    const nonceBuffer = randomBytes(box.nonceLength);
    const nonce = Buffer.from(nonceBuffer).toString("base64");
    const theirPublicKey = Buffer.from(theirPublicEncKey, "base64");
    const mySecretKey = Buffer.from(mySecretEncKey, "base64");
    const encBuffer = Buffer.from(box(msg, nonceBuffer, theirPublicKey, mySecretKey));
    const enc = encBuffer.toString("base64");
    return { enc, nonce };
  }

  /**
   * Asymmetrically decrypt an encrypted message using a key pair
   * @param enc Message to decrypt
   * @param nonce Random cryptographic one time value
   * @param theirPublicEncKey Other user's public encryption key
   * @param mySecretEncKey My secret encryption key
   */
  public static asymmetricDecrypt(
    enc: string, nonce: string, theirPublicEncKey: string, mySecretEncKey: string): Serializable {
    const encBuffer = Buffer.from(enc, "base64");
    const nonceBuffer = Buffer.from(nonce, "base64");
    const theirPublicKey = Buffer.from(theirPublicEncKey, "base64");
    const mySecretKey = Buffer.from(mySecretEncKey, "base64");
    const payloadBuffer = box.open(encBuffer, nonceBuffer, theirPublicKey, mySecretKey);
    if (payloadBuffer === null) {
      throw new Error("Unable to decrypt message.");
    }
    const rawPayload = Buffer.from(payloadBuffer).toString("utf8");
    return JSON.parse(rawPayload);
  }

  /**
   * Create a public and private signing key pair
   */
  public static generateSigningKeyPair() {
    const { publicKey: pubKeyBuffer, secretKey: secKeyBuffer } = sign.keyPair();
    const pubKey = Buffer.from(pubKeyBuffer).toString("base64");
    const secKey = Buffer.from(secKeyBuffer).toString("base64");
    return {
      publicSignKey: pubKey,
      secretSignKey: secKey
    };
  }

  /**
   * Sign a payload with a secret signing key
   * @param payload Serializable value to sign
   * @param secretSigningKey My secret signing key
   */
  public static signMessage(payload: Serializable, secretSigningKey: string) {
    const msgString = JSON.stringify(payload);
    const msg = Buffer.from(msgString, "utf8");
    const secretKey = Buffer.from(secretSigningKey, "base64");
    const signatureBuffer = sign.detached(msg, secretKey);
    const signature = Buffer.from(signatureBuffer).toString("base64");
    return signature;
  }

  public static verifySignature(payload: Serializable, signature: string, publicSignKey: string) {
    const msgString = JSON.stringify(payload);
    const msg = Buffer.from(msgString, "utf8");
    const sigBuffer = Buffer.from(signature, "base64");
    const publicKey = Buffer.from(publicSignKey, "base64");
    const validSignature = sign.detached.verify(msg, sigBuffer, publicKey);
    return validSignature;
  }

  private static NAME = "UDIA";
  private static VERSION = 1;
  private static KEYLEN = 96; // 96 bytes, 768 bits
}
