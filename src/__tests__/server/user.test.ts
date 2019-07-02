import uuidv4 from "uuid/v4";
import { USERS_TABLE } from "../../constants";
import { ICreateUserInput } from "../../graphql/schema";
import { asyncBatchWrite } from "../../modules/dbClient";
import { createUser, getUserAuthParams } from "../../server/user";
import { createUserHelper, templateUserParams } from "../testHelper";

describe("server/user.ts", () => {
  describe("createUser", () => {
    const username = `testCreateUser${new Date().getTime() % 9973}`;
    const uuid = uuidv4();
    const createUserParams = { ...templateUserParams, username, email: `${username}@udia.ca` };

    afterAll(() =>
      asyncBatchWrite({
        RequestItems: {
          [USERS_TABLE]: [
            { DeleteRequest: { Key: { uuid, type: 0 } } },
            { DeleteRequest: { Key: { uuid, type: 1 } } },
            { DeleteRequest: { Key: { uuid, type: 2 } } },
            { DeleteRequest: { Key: { uuid, type: 3 } } }
          ]
        }
      })
    );

    it("should create a User", async () => {
      expect.assertions(8);
      const authPayload = await createUser(createUserParams, uuid);
      expect(authPayload).toHaveProperty("jwt");
      expect(authPayload).toHaveProperty("user");
      const { user } = authPayload;
      expect(user).toHaveProperty("uuid", uuid);
      expect(user).toHaveProperty("username", username);
      expect(user).toHaveProperty("pwFunc", createUserParams.pwFunc);
      expect(user).toHaveProperty(
        "pwFuncOptions",
        createUserParams.pwFuncOptions
      );
      expect(user).toHaveProperty("createdAt");
      await expect(
        createUser(createUserParams)
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"Failed to create User"`);
    });

    it("should reject invalid parameters", async () => {
      expect.assertions(6);
      let invalid: ICreateUserInput = { ...createUserParams, username: "a" };
      await expect(
        createUser(invalid)
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"Failed to create User"`);
      invalid = { ...createUserParams, username: "a".repeat(25) };
      await expect(
        createUser(invalid)
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"Failed to create User"`);
      invalid = { ...createUserParams, username: "white space" };
      await expect(
        createUser(invalid)
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"Failed to create User"`);
      invalid = { ...createUserParams, username: "usern@me" };
      await expect(
        createUser(invalid)
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"Failed to create User"`);
      invalid = {
        ...createUserParams,
        pwFuncOptions: { ...createUserParams.pwFuncOptions, cost: 99999 }
      };
      await expect(
        createUser(invalid)
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"Failed to create User"`);
      invalid = { ...createUserParams, pwFunc: "argon2" };
      await expect(
        createUser(invalid)
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"Failed to create User"`);
    });
  });

  describe("getUserAuthParams", () => {
    const username = `testGetAuthParams${new Date().getTime() % 9973}`;
    let uuid: string | undefined;

    beforeAll(async () => {
      const userAuthPayload = await createUserHelper(username);
      uuid = userAuthPayload.user.uuid;
    });

    afterAll(() =>
      asyncBatchWrite({
        RequestItems: {
          [USERS_TABLE]: [
            { DeleteRequest: { Key: { uuid, type: 0 } } },
            { DeleteRequest: { Key: { uuid, type: 1 } } },
            { DeleteRequest: { Key: { uuid, type: 2 } } },
            { DeleteRequest: { Key: { uuid, type: 3 } } }
          ]
        }
      })
    );

    it("should get auth parameters", async () => {
      expect.assertions(2);
      const authParams = await getUserAuthParams(username);
      expect(authParams).toHaveProperty("pwFunc", "pbkdf2");
      expect(authParams).toHaveProperty("pwFuncOptions", {
        nonce: "TestHelperStubNonce",
        cost: 100000
      });
    });

    it("should fail on missing user", async () => {
      expect.assertions(1);
      await expect(
        getUserAuthParams("")
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"User does not exist"`);
    });
  });
});
