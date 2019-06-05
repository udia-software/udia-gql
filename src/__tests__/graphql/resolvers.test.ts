import uuidv5 from "uuid/v5";
import { USERS_TABLE, USERS_UUID_NS } from "../../constants";
import { resolvers } from "../../graphql/resolvers";
import { ICreateUserInput } from "../../graphql/schema";
import { client } from "../../modules/dbClient";

describe("graphql/resolvers.ts", () => {
  describe("Query", () => {
    const createdAt = new Date().getTime();
    const username = `${createdAt}QUERYLONG`;
    const lUsername = username.normalize("NFKC").toLowerCase().trim();
    const uuid = uuidv5(lUsername, USERS_UUID_NS);
    const params = {
      uuid, createdAt, username, pwFunc: "pbkdf2",
      pwFuncOptions: { nonce: "QueryLongTestNonce", cost: 100000 },
      pwServerHash: "$argon2id$v=19$m=32768,t=7,p=2$.garbage"
    };

    beforeAll(() => new Promise((resolve, reject) =>
      client.put({ TableName: USERS_TABLE, Item: params },
        (err, data) => { if (err) { reject(err); } else { resolve(data); } })
    ));
    afterAll(() => new Promise((resolve, reject) =>
      client.delete({ TableName: USERS_TABLE, Key: { uuid } },
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
      )).resolves.toStrictEqual({ pwFunc: params.pwFunc, pwFuncOptions: params.pwFuncOptions });
      await expect(resolvers.Query.getUserAuthParams(
        undefined, { username: "" })
      ).rejects.toThrowError("User does not exist");
    });
  });

  describe("Mutation", () => {
    const createdAt = new Date().getTime();
    const username = `${createdAt}MUTCREATE"`;
    const lUsername = username.normalize("NFKC").toLowerCase().trim();
    const uuid = uuidv5(lUsername, USERS_UUID_NS);
    const params = {
      username, pwFunc: "pbkdf2", pwFuncOptions: {
        nonce: "CreateUserMutationTestNonce", cost: 100000
      },
      pwh: "NeZZOxsAeSiAfR9cwLi36SrjS7gypsBL8yNnvbWi9kA="
    };
    const dbRemoveUser = () => new Promise((resolve, reject) =>
      client.delete(
        { TableName: USERS_TABLE, Key: { uuid } },
        (err, data) => {
          if (err) { reject(err); } else { resolve(data); }
        })
    );

    beforeAll(dbRemoveUser);
    afterAll(dbRemoveUser);

    it("calls createUser", async () => {
      expect.assertions(8);
      const data: ICreateUserInput = {
        username: "", pwh: "", pwFunc: "",
        pwFuncOptions: { nonce: "", cost: -1 }
      };
      const userPayload = await resolvers.Mutation.createUser(undefined, { data: params });
      expect(userPayload).toHaveProperty("jwt");
      expect(userPayload).toHaveProperty("user");
      const { user } = userPayload;
      expect(user).toHaveProperty("uuid", uuid);
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
