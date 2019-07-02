import { ICreateItemInput, ICreateUserInput } from "../graphql/schema";
import { createUser } from "../server/user";

export const templateUserParams: ICreateUserInput = {
  username: `test${new Date().getTime() % 9973}`,
  pwFunc: "pbkdf2",
  pwFuncOptions: { nonce: "TestHelperStubNonce", cost: 100000 },
  pwh: "NeZZOxsAeSiAfR9cwLi36SrjS7gypsBL8yNnvbWi9kA=",
  email: `test${new Date().getTime() % 9973}@udia.ca`,
  signKeyPayload: {
    publicKey: "stubPublicSignKey",
    encKeyPayload: {
      type: "SYMMETRIC",
      version: "v0",
      auth: "stubEncSecretSignAuthVal",
      iv: "stubEncSecretSignKeyIV",
      cipherText: "stubEncSecretSignKeyCipher"
    }
  },
  encryptKeyPayload: {
    publicKey: "stubPublicEncryptKey",
    encKeyPayload: {
      type: "SYMMETRIC",
      version: "v0",
      auth: "stubEncSecretEncryptAuthVal",
      iv: "stubEncSecretEncryptKeyIV",
      cipherText: "stubEncSecretEncryptKeyCipher"
    }
  }
};

export const templateItemParams: ICreateItemInput = {
  content: "stubItemContent",
  sig: "stubItemSig"
};

export function createUserHelper(username: string) {
  const params = { ...templateUserParams, username, email: `${username}@udia.ca` };
  return createUser(params);
}
