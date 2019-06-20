/**
 * Helper functions wrapping tweetnacl API.
 */
import { pbkdf2 } from "pbkdf2";
import { box, hash, randomBytes, secretbox, sign, verify } from "tweetnacl";

type Primative = string | number | boolean | null;
interface ISerializableArray extends ReadonlyArray<Serializable> {}
export type Serializable = Primative | Primative[] | ISerializableArray;

export interface IMasterKeys {
  pw: string;
  ek: string;
  ak: string;
}
export interface ICryptPayload {
  type: "SYMMETRIC" | "ASYMMETRIC";
  version: string;
  authHash: string;
  iv: string;
  cipherText: string;
}
export interface ISymmetricCryptPayload extends ICryptPayload {
  type: "SYMMETRIC";
}
export interface IAsymmetricCryptPayload extends ICryptPayload {
  type: "ASYMMETRIC";
}
export interface IKeyPair {
  type: "SIGN" | "ENCRYPT";
  publicKey: string;
  secretKey: string;
}
export interface ISignKeyPair extends IKeyPair {
  type: "SIGN";
}

export interface IEncryptKeyPair extends IKeyPair {
  type: "ENCRYPT";
}

export default class Crypt {
  public static VERSION = "v1";
  public static PK_LEN = 96; // bytes, 768 bits
  public static PW_NONCE_LEN = 32; // bytes, 256 bits

  /**
   * Generate a random base64 encoded nonce string
   * @param nonceByteLength Buffer byte length
   */
  public static async generateNonce(
    nonceByteLength: number = this.PW_NONCE_LEN
  ) {
    return Buffer.from(randomBytes(nonceByteLength)).toString("base64");
  }

  /**
   * Generate the three required keys for UDIA auth & crypto
   * @param username Username of user
   * @param uip User inputted password
   * @param nonce Random string created on user creation
   * @param cost Number of pbkdf2 iterations
   */
  public static async deriveMasterKeys(
    username: string,
    uip: string,
    nonce: string,
    cost: number
  ): Promise<IMasterKeys> {
    const normName = username
      .normalize("NFKC")
      .trim()
      .toLowerCase();

    // Compute Salt from Nonce
    const preSaltString = [this.VERSION, cost, nonce, normName].join("|");
    const preSaltBuffer = Buffer.from(preSaltString, "utf8");
    const uint8Salt = hash(preSaltBuffer);
    const salt = Buffer.from(uint8Salt);

    // Derive primary key
    const keyBuf = await new Promise<Buffer>((resolve, reject) => {
      pbkdf2(uip, salt, cost, this.PK_LEN, "sha512", (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(derivedKey);
        }
      });
    });

    // Split primary key into three parts
    const pwBuf = keyBuf.subarray(0, keyBuf.length / 3);
    const pw = Buffer.from(pwBuf).toString("base64");
    const ekBuf = keyBuf.subarray(keyBuf.length / 3, (2 * keyBuf.length) / 3);
    const ek = Buffer.from(ekBuf).toString("base64");
    const akBuf = keyBuf.subarray((2 * keyBuf.length) / 3, keyBuf.length);
    const ak = Buffer.from(akBuf).toString("base64");

    return { pw, ek, ak };
  }

  /**
   * Symmetrically encrypt a serialzable payload using ek and ak
   * Implements xsalsa20-poly1305
   * @param payload Serializable value to encrypt
   * @param ek User derived encryption key
   * @param ak User derived authentication key
   * @param encoding JSON stringified payload encoding (default "utf8")
   */
  public static symmetricEncrypt(
    payload: Serializable,
    ek: string,
    ak: string,
    encoding: string = "utf8"
  ): ISymmetricCryptPayload {
    const msgString = JSON.stringify(payload);
    const msgBuffer = Buffer.from(msgString, encoding);
    const encryptionKey = Buffer.from(ek, "base64");
    const authKey = Buffer.from(ak, "base64");

    const ivLen = 2 * secretbox.nonceLength;
    const ivBuf = randomBytes(ivLen);
    const ivEk = ivBuf.subarray(0, ivLen / 2);
    const ivAk = ivBuf.subarray(ivLen / 2, ivLen);

    // encrypt the payload
    const cipherBuf = secretbox(msgBuffer, ivEk, encryptionKey);

    // generate the item auth string and hash
    const bufToAuth = Buffer.concat([
      Buffer.from(this.VERSION),
      Buffer.from(ivAk),
      Buffer.from(cipherBuf),
      authKey
    ]);
    const authHashBuf = hash(bufToAuth);

    // serialize buffers into base64 strings
    const authHash = Buffer.from(authHashBuf).toString("base64");
    const iv = Buffer.from(ivBuf).toString("base64");
    const cipherText = Buffer.from(cipherBuf).toString("base64");
    return {
      type: "SYMMETRIC",
      version: this.VERSION,
      authHash,
      iv,
      cipherText
    };
  }

  /**
   * Decrypt an symmetrically encrypted message using ek and ak
   * @param payload Symmetrically encrypted serialized message
   * @param ek User derived encryption key
   * @param ak User derived authentication key
   */
  public static symmetricDecrypt(
    payload: ISymmetricCryptPayload,
    ek: string,
    ak: string,
    encoding: string = "utf8"
  ): Serializable {
    const { version, authHash, iv, cipherText } = payload;
    if (version !== this.VERSION) {
      throw new Error("Unsupported Crypt protocol version");
    }
    const encryptionKey = Buffer.from(ek, "base64");
    const authKey = Buffer.from(ak, "base64");
    const cipherBuf = Buffer.from(cipherText, "base64");
    const ivBuf = Buffer.from(iv, "base64");
    const ivLen = 2 * secretbox.nonceLength;
    const ivEk = ivBuf.subarray(0, ivLen / 2);
    const ivAk = ivBuf.subarray(ivLen / 2, ivLen);
    const authHashBuf = Buffer.from(authHash, "base64");

    // verify the auth hash is correct
    const bufToAuth = Buffer.concat([
      Buffer.from(this.VERSION),
      Buffer.from(ivAk),
      Buffer.from(cipherBuf),
      authKey
    ]);
    const localAuthHashBuf = hash(bufToAuth);
    if (!verify(localAuthHashBuf, authHashBuf)) {
      throw new Error("AuthHash mismatch, payload invalid");
    }

    // decrypt the symmetric payload into the original serialized value
    const payloadBuffer = secretbox.open(cipherBuf, ivEk, encryptionKey);
    if (payloadBuffer === null) {
      throw new Error("Unable to decrypt payload");
    }
    const rawPayload = Buffer.from(payloadBuffer).toString(encoding);
    return JSON.parse(rawPayload);
  }

  /**
   * Create a public and private asymmetric encryption key pair
   * Implements x25519-xsalsa20-poly1305
   */
  public static generateEncryptionKeyPair(): IEncryptKeyPair {
    const { publicKey: pubKeyBuf, secretKey: secKeyBuf } = box.keyPair();
    const publicKey = Buffer.from(pubKeyBuf).toString("base64");
    const secretKey = Buffer.from(secKeyBuf).toString("base64");
    return {
      type: "ENCRYPT",
      publicKey,
      secretKey
    };
  }

  /**
   * Create a public and private signing key pair
   * Implements ed25519
   */
  public static generateSigningKeyPair(): ISignKeyPair {
    const { publicKey: pubKeyBuf, secretKey: secKeyBuf } = sign.keyPair();
    const publicKey = Buffer.from(pubKeyBuf).toString("base64");
    const secretKey = Buffer.from(secKeyBuf).toString("base64");
    return {
      type: "SIGN",
      publicKey,
      secretKey
    };
  }

  /**
   * Asymmetrically encrypt a serialzable payload using a pub/sec key pair
   * @param payload Serializeable value to encrypt
   * @param theirPublicEncryptKey Other user's public encryption key
   * @param myEncryptKeyPair My encryption key pair
   * @param encoding JSON stringified payload encoding (default "utf8")
   */
  public static asymmetricEncrypt(
    payload: Serializable,
    theirPublicEncryptKey: string,
    myEncryptKeyPair: IEncryptKeyPair,
    encoding: string = "utf8"
  ): IAsymmetricCryptPayload {
    const msgString = JSON.stringify(payload);
    const msgBuffer = Buffer.from(msgString, encoding);
    const publicKey = Buffer.from(myEncryptKeyPair.publicKey, "base64");
    const secretKey = Buffer.from(myEncryptKeyPair.secretKey, "base64");
    const theirPublicKey = Buffer.from(theirPublicEncryptKey, "base64");

    const ivLen = 2 * box.nonceLength;
    const ivBuf = randomBytes(ivLen);
    const ivEk = ivBuf.subarray(0, ivLen / 2);
    const ivAk = ivBuf.subarray(ivLen / 2, ivLen);

    // encrypt the payload
    const cipherBuf = box(msgBuffer, ivEk, theirPublicKey, secretKey);

    // generate the item auth string and hash
    const bufToAuth = Buffer.concat([
      Buffer.from(this.VERSION),
      Buffer.from(ivAk),
      Buffer.from(cipherBuf),
      theirPublicKey,
      publicKey
    ]);
    const authHashBuf = hash(bufToAuth);

    // serialize buffers into base64 strings
    const authHash = Buffer.from(authHashBuf).toString("base64");
    const iv = Buffer.from(ivBuf).toString("base64");
    const cipherText = Buffer.from(cipherBuf).toString("base64");
    return {
      type: "ASYMMETRIC",
      version: this.VERSION,
      authHash,
      iv,
      cipherText
    };
  }

  /**
   * Asymmetrically decrypt an encrypted message using a key pair
   * @param payload Asymmetricly encrypted payload
   * @param theirPublicEncryptKey Sender user's public encryption key
   * @param myEncryptKeyPair  My encryption key pair
   * @param encoding JSON stringified payload encoding (default "utf8")
   */
  public static asymmetricDecrypt(
    payload: IAsymmetricCryptPayload,
    theirPublicEncryptKey: string,
    myEncryptKeyPair: IEncryptKeyPair,
    encoding: string = "utf8"
  ): Serializable {
    const { version, authHash, iv, cipherText } = payload;
    if (version !== this.VERSION) {
      throw new Error("Unsupported Crypt protocol version");
    }
    const theirPublicKey = Buffer.from(theirPublicEncryptKey, "base64");
    const publicKey = Buffer.from(myEncryptKeyPair.publicKey, "base64");
    const secretKey = Buffer.from(myEncryptKeyPair.secretKey, "base64");
    const cipherBuf = Buffer.from(cipherText, "base64");
    const ivBuf = Buffer.from(iv, "base64");
    const ivLen = 2 * box.nonceLength;
    const ivEk = ivBuf.subarray(0, ivLen / 2);
    const ivAk = ivBuf.subarray(ivLen / 2, ivLen);
    const authHashBuf = Buffer.from(authHash, "base64");

    // verify the auth hash is correct
    const bufToAuth = Buffer.concat([
      Buffer.from(this.VERSION),
      Buffer.from(ivAk),
      Buffer.from(cipherBuf),
      publicKey,
      theirPublicKey
    ]);
    const localAuthHashBuf = hash(bufToAuth);
    if (!verify(localAuthHashBuf, authHashBuf)) {
      throw new Error("AuthHash mismatch, payload invalid");
    }

    // decrypt the asymmetric payload into the original serialized value
    const payloadBuffer = box.open(cipherBuf, ivEk, theirPublicKey, secretKey);
    if (payloadBuffer === null) {
      throw new Error("Unable to decrypt message.");
    }
    const rawPayload = Buffer.from(payloadBuffer).toString(encoding);
    return JSON.parse(rawPayload);
  }

  /**
   * Sign a payload with a secret signing key
   * @param payload Serializable value to sign
   * @param secretSigningKey My secret signing key
   */
  public static signMessage(
    payload: Serializable,
    signKeyPair: ISignKeyPair,
    encoding: string = "utf8"
  ): string {
    const msgString = JSON.stringify(payload);
    const msg = Buffer.from(msgString, encoding);
    const secretKey = Buffer.from(signKeyPair.secretKey, "base64");
    const sigBuffer = sign.detached(msg, secretKey);
    return Buffer.from(sigBuffer).toString("base64");
  }

  public static verifySignature(
    payload: Serializable,
    signature: string,
    publicSignKey: string
  ): boolean {
    const msgString = JSON.stringify(payload);
    const msg = Buffer.from(msgString, "utf8");
    const sigBuffer = Buffer.from(signature, "base64");
    const publicKey = Buffer.from(publicSignKey, "base64");
    return sign.detached.verify(msg, sigBuffer, publicKey);
  }
}
