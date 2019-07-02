import uuidv4 from "uuid/v4";
import { USERS_TABLE } from "../../constants";
import { ICreateItemInput } from "../../graphql/schema";
import { asyncBatchWrite } from "../../modules/dbClient";
import { createItem } from "../../server/item";
import { createUserHelper, templateItemParams } from "../testHelper";

describe("server/item.ts", () => {
  const username = `testServerItem${new Date().getTime() % 9973}`;
  const uuid = uuidv4();
  let userId: string | undefined;

  beforeAll(async () => {
    const userAuth = await createUserHelper(username);
    userId = userAuth.user.uuid;
  });

  afterAll(() => asyncBatchWrite({
    RequestItems: {
      [USERS_TABLE]: [
        { DeleteRequest: { Key: { uuid: userId, type: 0 } } },
        { DeleteRequest: { Key: { uuid: userId, type: 1 } } },
        { DeleteRequest: { Key: { uuid: userId, type: 2 } } },
        { DeleteRequest: { Key: { uuid: userId, type: 3 } } }
      ]
    }
  }));

  describe("createItem", () => {
    const itemParams: ICreateItemInput = { ...templateItemParams };
    it("should create an item with closure", async () => {
      const itemPayload = await createItem(itemParams, userId, uuid);
      expect(itemPayload).toHaveProperty("uuid", uuid);
      expect(itemPayload).toHaveProperty("content", itemParams.content);
      expect(itemPayload).toHaveProperty("sig", itemParams.sig);

      // nested items also work correctly
      const childParams: ICreateItemInput = { ...itemParams, parentId: uuid };
      const childPayload = await createItem(childParams, userId);
      expect(childPayload).toHaveProperty("parentId", itemPayload.uuid);

      const grandChildParams: ICreateItemInput = { ...itemParams, parentId: childPayload.uuid };
      const grandChildPayload = await createItem(grandChildParams, userId);
      expect(grandChildPayload).toHaveProperty("parentId", childPayload.uuid);
    });
  });
});
