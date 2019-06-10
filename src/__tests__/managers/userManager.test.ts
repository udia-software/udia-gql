import uuidv5 from "uuid/v5";
import { USERS_TABLE, USERS_UUID_NS } from "../../constants";
import UserManager from "../../managers/userManager";
import { client } from "../../modules/dbClient";

describe("managers/userManager.ts", () => {
  describe("createUser", () => {
    const username = new Date().getTime() + "CREATE";
    const lUsername = username.normalize("NFKC").toLowerCase().trim();
    const uuid = uuidv5(lUsername, USERS_UUID_NS);
    const params = {
      username, pwFunc: "pbkdf2", pwFuncOptions: {
        nonce: "CreateUserTestNonce", cost: 100000
      },
      pwh: "NeZZOxsAeSiAfR9cwLi36SrjS7gypsBL8yNnvbWi9kA="
    };
    const dbRemoveUser = () => new Promise((resolve, reject) =>
      client.delete(
        { TableName: USERS_TABLE, Key: { uuid, type: UserManager.TYPE_USERNAME } },
        (err, data) => {
          if (err) { reject(err); } else { resolve(data); }
        })
    );

    beforeAll(dbRemoveUser);
    afterAll(dbRemoveUser);

    it("should create a User", async () => {
      expect.assertions(8);
      const authPayload = await UserManager.createUser(params);
      expect(authPayload).toHaveProperty("jwt");
      expect(authPayload).toHaveProperty("user");
      const { user } = authPayload;
      expect(user).toHaveProperty("uuid", uuid);
      expect(user).toHaveProperty("username", username);
      expect(user).toHaveProperty("pwFunc", params.pwFunc);
      expect(user).toHaveProperty("pwFuncOptions", params.pwFuncOptions);
      expect(user).toHaveProperty("createdAt");
      // fail to create the user if already created
      await expect(UserManager.createUser(params)).rejects.toThrowError("Failed to create User");
    });

    it("should reject invalid parameters", async () => {
      expect.assertions(5);
      let invalid = { ...params, username: "a" };
      await expect(UserManager.createUser(invalid)).rejects.toThrowError("Failed to create User");
      invalid = { ...params, username: "a".repeat(25) };
      await expect(UserManager.createUser(invalid)).rejects.toThrowError("Failed to create User");
      invalid = { ...params, username: "white space" };
      await expect(UserManager.createUser(invalid)).rejects.toThrowError("Failed to create User");
      invalid = { ...params, pwFuncOptions: { ...params.pwFuncOptions, cost: 99999 } };
      await expect(UserManager.createUser(invalid)).rejects.toThrowError("Failed to create User");
      invalid = { ...params, pwFunc: "argon2" };
      await expect(UserManager.createUser(invalid)).rejects.toThrowError("Failed to create User");
    });
  });

  describe("getUserAuthParams", () => {
    const createdAt = new Date().getTime();
    const username = `${createdAt}GETAUTH`;
    const lUsername = username.normalize("NFKC").toLowerCase().trim();
    const uuid = uuidv5(lUsername, USERS_UUID_NS);
    const params = {
      uuid, type: UserManager.TYPE_USERNAME, createdAt, payload: username, pwFunc: "pbkdf2",
      pwFuncOptions: { nonce: "GetUserAuthTestNonce", cost: 100000 },
      pwServerHash: "$argon2id$v=19$m=32768,t=7,p=2$.garbage"
    };

    beforeAll(() => new Promise((resolve, reject) =>
      client.put({ TableName: USERS_TABLE, Item: params },
        (err, data) => { if (err) { reject(err); } else { resolve(data); } })
    ));
    afterAll(() => new Promise((resolve, reject) =>
      client.delete({ TableName: USERS_TABLE, Key: { uuid, type: UserManager.TYPE_USERNAME } },
        (err, data) => { if (err) { reject(err); } else { resolve(data); } })
    ));

    it("should get auth parameters", async () => {
      expect.assertions(2);
      const authParams = await UserManager.getUserAuthParams(username);
      expect(authParams).toHaveProperty("pwFunc", params.pwFunc);
      expect(authParams).toHaveProperty("pwFuncOptions", params.pwFuncOptions);
    });

    it("should fail on missing user", async () => {
      expect.assertions(1);
      await expect(UserManager.getUserAuthParams("")).rejects.toThrowError("User does not exist");
    });
  });
});
