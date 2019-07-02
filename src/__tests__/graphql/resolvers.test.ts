import { USERS_TABLE } from "../../constants";
import { resolvers } from "../../graphql/resolvers";
import { asyncBatchWrite } from "../../modules/dbClient";
import { createUserHelper, templateUserParams } from "../testHelper";

describe("graphql/resolvers.ts", () => {
  describe("Query", () => {
    const username = `testQuery${new Date().getTime() % 9973}`;
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

    it("queries hello", () => {
      expect.assertions(1);
      expect(resolvers.Query.hello()).toBe("Hello world!");
    });

    it("queries getUserAuthParams", async () => {
      expect.assertions(2);
      await expect(
        resolvers.Query.getUserAuthParams(undefined, { username })
      ).resolves.toStrictEqual({
        pwFunc: "pbkdf2",
        pwFuncOptions: { nonce: "TestHelperStubNonce", cost: 100000 }
      });
      await expect(
        resolvers.Query.getUserAuthParams(undefined, { username: "" })
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"User does not exist"`);
    });
  });

  describe("Mutation", () => {
    const username = `testMutation${new Date().getTime() % 9973}`;
    const data = {
      ...templateUserParams,
      username,
      email: `${username}@udia.ca`
    };
    let uuid: string | undefined;

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

    it("calls createUser", async () => {
      expect.assertions(8);
      const userPayload = await resolvers.Mutation.createUser(undefined, {
        data
      });
      expect(userPayload).toHaveProperty("jwt");
      expect(userPayload).toHaveProperty("user");
      const { user } = userPayload;
      expect(user).toHaveProperty("uuid");
      uuid = user.uuid;
      expect(user).toHaveProperty("username", username);
      expect(user).toHaveProperty("pwFunc", data.pwFunc);
      expect(user).toHaveProperty("pwFuncOptions", data.pwFuncOptions);
      expect(user).toHaveProperty("createdAt");

      // cannot create user twice
      await expect(
        resolvers.Mutation.createUser(undefined, { data })
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"Failed to create User"`);
    });
  });
});
