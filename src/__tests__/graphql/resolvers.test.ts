import uuidv4 from "uuid/v4";
import uuidv5 from "uuid/v5";
import { USERS_TABLE, USERS_UUID_NS } from "../../constants";
import { resolvers } from "../../graphql/resolvers";
import { ICreateUserInput } from "../../graphql/schema";
import UserManager from "../../managers/userManager";
import { docDbClient } from "../../modules/dbClient";

describe("graphql/resolvers.ts", () => {
  describe("Query", () => {
    const createdAt = new Date().getTime();
    const username = `${createdAt}QUERYLONG`;
    const lUsername = username.normalize("NFKC").toLowerCase().trim();
    const uuid = uuidv4();
    const usernameId = uuidv5(lUsername, USERS_UUID_NS);
    const params = {
      uuid, type: UserManager.TYPE_USERNAME,
      payloadId: usernameId,
      payload: {
        username, pwFunc: "pbkdf2",
        pwFuncOptions: { nonce: "QueryLongTestNonce", cost: 100001 },
        pwServerHash: "$argon2id$v=19$m=32768,t=7,p=2$.garbage",
        createdAt
      }
    };

    beforeAll(() => new Promise((resolve, reject) =>
      docDbClient.put({ TableName: USERS_TABLE, Item: params },
        (err, data) => { if (err) { reject(err); } else { resolve(data); } })
    ));
    afterAll(() => new Promise((resolve, reject) =>
      docDbClient.delete({ TableName: USERS_TABLE, Key: { uuid, type: UserManager.TYPE_USERNAME } },
        (err, data) => { if (err) { reject(err); } else { resolve(data); } })
    ));

    it("queries hello", () => {
      expect.assertions(1);
      expect(resolvers.Query.hello()).toBe("Hello world!");
    });

    it("queries getUserAuthParams", async () => {
      expect.assertions(2);
      await expect(resolvers.Query.getUserAuthParams(
        undefined, { username }
      )).resolves.toStrictEqual({ pwFunc: "pbkdf2", pwFuncOptions: { nonce: "QueryLongTestNonce", cost: 100001 } });
      await expect(resolvers.Query.getUserAuthParams(
        undefined, { username: "" })
      ).rejects.toThrowError("User does not exist");
    });
  });

  describe("Mutation", () => {
    const createdAt = new Date().getTime();
    const username = `${createdAt}MUTCREATE"`;
    const params: ICreateUserInput = {
      username, pwFunc: "pbkdf2", pwFuncOptions: {
        nonce: "CreateUserMutationTestNonce", cost: 100000
      },
      pwh: "NeZZOxsAeSiAfR9cwLi36SrjS7gypsBL8yNnvbWi9kA=",
      signKeyPayload: {
        publicKey: "stubPublicSignKey",
        encKeyPayload: {
          enc: "stubEncSecretSignKey",
          nonce: "stubEncSecretSignKeyNonce"
        }
      },
      encryptKeyPayload: {
        publicKey: "stubPublicEncryptKey",
        encKeyPayload: {
          enc: "stubEncSecretEncryptKey",
          nonce: "stubEncSecretEncryptKeyNonce"
        }
      }
    };

    it("calls createUser", async () => {
      expect.assertions(8);
      const data: ICreateUserInput = {
        username: "", pwh: "", pwFunc: "",
        pwFuncOptions: { nonce: "", cost: -1 },
        signKeyPayload: {
          publicKey: "stubPublicSignKey",
          encKeyPayload: {
            enc: "stubEncSecretSignKey",
            nonce: "stubEncSecretSignKeyNonce"
          }
        },
        encryptKeyPayload: {
          publicKey: "stubPublicEncryptKey",
          encKeyPayload: {
            enc: "stubEncSecretEncryptKey",
            nonce: "stubEncSecretEncryptKeyNonce"
          }
        }
      };
      const userPayload = await resolvers.Mutation.createUser(undefined, { data: params });
      expect(userPayload).toHaveProperty("jwt");
      expect(userPayload).toHaveProperty("user");
      const { user } = userPayload;
      expect(user).toHaveProperty("uuid");
      expect(user).toHaveProperty("username", username);
      expect(user).toHaveProperty("pwFunc", params.pwFunc);
      expect(user).toHaveProperty("pwFuncOptions", params.pwFuncOptions);
      expect(user).toHaveProperty("createdAt");

      await expect(resolvers.Mutation.createUser(
        undefined, { data }
      )).rejects.toThrowError("Failed to create User");
    });
  });
});
