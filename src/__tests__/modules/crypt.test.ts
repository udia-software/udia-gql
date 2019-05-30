import Crypt from "../../modules/crypt";

describe("modules/crypt.ts", () => {
  // password for server authentication
  const pw = "MeZZOxsAeSiAfR9cwLi36SrjS7gypsBL8yNnvbWi9kA=";
  // private key for symmetric & asymmetric encryption
  const ek = "m87aGxICnTq4KlM0rk/w/HcfICjAnuV1njNpsPcaRZA=";
  // deterministic secret key for encrypting signing key pair
  const sk = "iQgTwA+LhlnBpUj2nCCneeTFEFa8k0AqRS0cTyi00Vs=";
  // public key derived from private key
  const pEk = "8pOyYKjCm2PDfcoE2PRFb8ZBY1KpLOgMyaYAiCuxUx4=";

  it("should derive master keys consistently", async () => {
    expect.assertions(1);
    const username = "cthon98";
    const password = "Hunter!2";
    const nonce = "PseudoRandomBase64String";
    const cost = 1000;
    const mkeys = await Crypt.deriveMasterKeys(username, password, nonce, cost);
    expect(mkeys).toStrictEqual({ pw, ek, sk });
  });

  it("should symmetric encrypt/decrypt consistently", () => {
    expect.assertions(4);
    const sample = [["foo", "bar"], "abc", 123];
    const encSample = Crypt.symmetricEncrypt(sample, ek);
    expect(encSample).toHaveProperty("enc");
    expect(encSample).toHaveProperty("nonce");
    const decrypted = Crypt.symmetricDecrypt(encSample.enc, encSample.nonce, ek);
    expect(decrypted).toStrictEqual(sample);
    // things that cannot be decrypted should throw an error
    expect(() => Crypt.symmetricDecrypt("", encSample.nonce, ek)).toThrowError(
      "Unable to decrypt message."
    );
  });

  it("should generate a public key pair from a secret key", () => {
    expect.assertions(1);
    const pubEncKey = Crypt.derivePublicEncryptionKey(ek);
    expect(pubEncKey).toBe(pEk);
  });

  it("should generate usable encryption key pair", () => {
    expect.assertions(9);
    const encKeyPairAlice = Crypt.generateEncryptionKeyPair();
    expect(encKeyPairAlice).toHaveProperty("publicEncKey");
    expect(encKeyPairAlice).toHaveProperty("secretEncKey");
    const encKeyPairBob = Crypt.generateEncryptionKeyPair();
    expect(encKeyPairBob).toHaveProperty("publicEncKey");
    expect(encKeyPairBob).toHaveProperty("secretEncKey");
    const sample = ["bar", ["foo", 123], "abc"];
    const encSample = Crypt.asymmetricEncrypt(sample, encKeyPairBob.publicEncKey, encKeyPairAlice.secretEncKey);
    expect(encSample).toHaveProperty("enc");
    expect(encSample).toHaveProperty("nonce");
    const decrypted = Crypt.asymmetricDecrypt(
      encSample.enc, encSample.nonce, encKeyPairAlice.publicEncKey, encKeyPairBob.secretEncKey);
    expect(decrypted).toStrictEqual(sample);
    // can reverse public and private keys, encryption still works
    const decrupted2 = Crypt.asymmetricDecrypt(
      encSample.enc, encSample.nonce, encKeyPairBob.publicEncKey, encKeyPairAlice.secretEncKey);
    expect(decrupted2).toStrictEqual(sample);
    expect(() => Crypt.asymmetricDecrypt(
      "", encSample.nonce, encKeyPairBob.publicEncKey, encKeyPairAlice.secretEncKey)).toThrowError(
        "Unable to decrypt message."
      );
  });

  it("should generate usable signing key pair", () => {
    expect.assertions(6);
    const signKeyPairAlice = Crypt.generateSigningKeyPair();
    expect(signKeyPairAlice).toHaveProperty("publicSignKey");
    expect(signKeyPairAlice).toHaveProperty("secretSignKey");
    const signKeyPairBob = Crypt.generateSigningKeyPair();
    expect(signKeyPairBob).toHaveProperty("publicSignKey");
    expect(signKeyPairBob).toHaveProperty("secretSignKey");
    const sample = [ "a", 1, "b", -1, "c", 2, "d", -2 ];
    const sig = Crypt.signMessage(sample, signKeyPairAlice.secretSignKey);
    const sigValid = Crypt.verifySignature(sample, sig, signKeyPairAlice.publicSignKey);
    expect(sigValid).toBeTruthy();
    const sigInvalid = Crypt.verifySignature(sample, sig, signKeyPairBob.publicSignKey);
    expect(sigInvalid).toBeFalsy();
  });
});
