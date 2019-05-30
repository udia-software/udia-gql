import { resolvers } from "../../graphql/resolvers";
import { ICreateUserInput } from "../../graphql/schema";

describe("resolvers.ts", () => {
  describe("Query", () => {
    it("queries hello", () => {
      expect.assertions(1);
      expect(resolvers.Query.hello()).toBe("Hello world!");
    });
    it("queries getUserAuthParams", async () => {
      expect.assertions(1);
      await expect(resolvers.Query.getUserAuthParams(
        undefined, { username: "" })
      ).rejects.toThrowError("User does not exist");
    });
  });

  describe("Mutation", () => {
    it("createUser", async () => {
      expect.assertions(1);
      const data: ICreateUserInput = {
        username: "",
        pwh: "",
        pwFunc: "",
        pwFuncOptions: {
          nonce: "",
          cost: -1
        }
      };
      await expect(resolvers.Mutation.createUser(
        undefined, { data }
      )).rejects.toThrowError("Failed to create User");
    });
  });
});
