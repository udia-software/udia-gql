import Crypt from "../../modules/crypt";

describe("modules/crypt.ts", () => {
  // password for server authentication
  const pw = "c+pp+WKUsXgVonq85W6pv2YzoAXL4tgjNZp9774hpNo=";
  // private key for symmetric & asymmetric encryption
  const ek = "XRGuqEfc8Ewwgrao7Zh0QMn9pajCbrIZuN4/gZvqY+8=";
  // deterministic secret key for encrypting signing key pair
  const ak = "lkqy+hjuPJeKNraFq77u9QDdbXxdirQgpwDE1RVbrZo=";

  it("should derive master keys consistently", async () => {
    expect.assertions(1);
    const username = "cthon98";
    const password = "Hunter!2";
    const nonce = "PseudoRandomBase64String";
    const cost = 1000;
    const mkeys = await Crypt.deriveMasterKeys(username, password, nonce, cost);
    expect(mkeys).toStrictEqual({ pw, ek, ak });
  });

  it("should symmetric encrypt/decrypt consistently", () => {
    const sample = [["foo", "bar"], "abc", 123];
    const encSample = Crypt.symmetricEncrypt(sample, ek, ak);
    expect(encSample).toHaveProperty("type", "SYMMETRIC");
    expect(encSample).toHaveProperty("version", "v1");
    expect(encSample).toHaveProperty("auth");
    expect(encSample).toHaveProperty("iv");
    expect(encSample).toHaveProperty("cipherText");
    const decrypted = Crypt.symmetricDecrypt(encSample, ek, ak);
    expect(decrypted).toStrictEqual(sample);
    // things that cannot be decrypted should throw an error
    expect(() =>
      Crypt.symmetricDecrypt({ ...encSample, auth: "bad" }, ek, ak)
    ).toThrowError("AuthHash mismatch, payload invalid");
  });

  it("should generate usable encryption key pair", () => {
    const encKeyPairAlice = Crypt.generateEncryptionKeyPair();
    expect(encKeyPairAlice).toHaveProperty("type", "ENCRYPT");
    expect(encKeyPairAlice).toHaveProperty("publicKey");
    expect(encKeyPairAlice).toHaveProperty("secretKey");
    const signKeyPairAlice = Crypt.generateSigningKeyPair();
    expect(signKeyPairAlice).toHaveProperty("type", "SIGN");
    expect(signKeyPairAlice).toHaveProperty("publicKey");
    expect(signKeyPairAlice).toHaveProperty("secretKey");

    const encKeyPairBob = Crypt.generateEncryptionKeyPair();
    expect(encKeyPairBob).toHaveProperty("type", "ENCRYPT");
    expect(encKeyPairBob).toHaveProperty("publicKey");
    expect(encKeyPairBob).toHaveProperty("secretKey");
    const sample = ["bar", ["foo", 123], "abc"];
    const encSample = Crypt.asymmetricEncrypt(
      sample,
      encKeyPairBob.publicKey,
      encKeyPairAlice,
      signKeyPairAlice
    );
    expect(encSample).toHaveProperty("type", "ASYMMETRIC");
    expect(encSample).toHaveProperty("version", "v1");
    expect(encSample).toHaveProperty("auth");
    expect(encSample).toHaveProperty("iv");
    expect(encSample).toHaveProperty("cipherText");
    const decrypted = Crypt.asymmetricDecrypt(
      encSample,
      signKeyPairAlice.publicKey,
      encKeyPairAlice.publicKey,
      encKeyPairBob
    );
    expect(decrypted).toStrictEqual(sample);
  });

  it("should generate usable signing key pair", () => {
    const signKeyPairAlice = Crypt.generateSigningKeyPair();
    expect(signKeyPairAlice).toHaveProperty("type", "SIGN");
    expect(signKeyPairAlice).toHaveProperty("publicKey");
    expect(signKeyPairAlice).toHaveProperty("secretKey");
    const signKeyPairBob = Crypt.generateSigningKeyPair();
    expect(signKeyPairBob).toHaveProperty("type", "SIGN");
    expect(signKeyPairBob).toHaveProperty("publicKey");
    expect(signKeyPairBob).toHaveProperty("secretKey");
    const sample = ["a", 1, "b", -1, "c", 2, "d", -2];
    const sig = Crypt.signMessage(sample, signKeyPairAlice);
    const sigValid = Crypt.verifySignature(
      sample,
      sig,
      signKeyPairAlice.publicKey
    );
    expect(sigValid).toBeTruthy();
    const sigInvalid = Crypt.verifySignature(
      sample,
      sig,
      signKeyPairBob.publicKey
    );
    expect(sigInvalid).toBeFalsy();
  });
});
