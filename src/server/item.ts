import { AuthenticationError } from "apollo-server-core";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import uuidv4 from "uuid/v4";
import { ITEMS_TABLE } from "../constants";
import { ICreateItemInput, IItem, IPaginatedItems, IPaginateItemInput } from "../graphql/schema";
import { ENC_TYPE_ASYM, ENC_TYPE_SYM } from "../modules/crypt";
import { asyncBatchWrite, asyncQuery } from "../modules/dbClient";
import { getUserById, getUserStubByUsername } from "./user";

interface IDynamoItem {
  uuid: string;
  depth: number; // 0 = self, 1 = ancestor child, 2 = ancestor grandchild, etc.
  ancestor?: string; // closure, undefined if depth is 0, otherwise item uuid
  creator: string; // creator user's uuid
  createdAtDay: string; // hash key to enable query over time
  payload?: {
    content: string;
    sig: string;
    encryptionType?: "ASYMMETRIC" | "SYMMETRIC";
    version?: string;
    auth?: string;
    iv?: string;
    createdAt: number;
  };
}

export async function createItem(
  params: ICreateItemInput, userId?: string, uuid: string = uuidv4()
): Promise<IItem> {
  if (!userId) {
    throw new AuthenticationError("User is not authenticated");
  }
  const user = await getUserById(userId);
  const now = new Date();
  const createdAt = now.getTime();
  const createdAtDay = now.toISOString().split("T")[0];

  const { parentId, content, sig, encryptionType, version, auth, iv } = params;
  const newItem: IDynamoItem = {
    uuid, depth: 0, creator: userId, createdAtDay, payload: {
      content, sig, encryptionType, version, auth, iv, createdAt
    }
  };
  const itemTableRequests: DocumentClient.WriteRequests = [{ PutRequest: { Item: newItem } }];

  // If the parent is set, update the closures for all necessary ancestors
  if (parentId) {
    let LastEvaluatedKey: DocumentClient.Key | undefined;
    while (true) {
      const queryAncestorsOutput = await asyncQuery({
        TableName: ITEMS_TABLE,
        KeyConditionExpression: "#uuid = :parentId AND #depth >= :zero",
        ExpressionAttributeValues: { ":parentId": parentId, ":zero": 0 },
        ExpressionAttributeNames: { "#uuid": "uuid", "#depth": "depth" },
        ProjectionExpression: "ancestor, #depth",
        ExclusiveStartKey: LastEvaluatedKey
      });
      if (queryAncestorsOutput.Items !== undefined) {
        for (const item of queryAncestorsOutput.Items) {
          const { ancestor, depth } = item as IDynamoItem;
          const closureItem: IDynamoItem = { uuid, depth: depth + 1, ancestor, creator: userId, createdAtDay };
          itemTableRequests.push({ PutRequest: { Item: closureItem } });
        }
      }
      // pagination handling
      if (queryAncestorsOutput.LastEvaluatedKey !== undefined) {
        LastEvaluatedKey = queryAncestorsOutput.LastEvaluatedKey;
      } else {
        break;
      }
    }
  }

  // Persist the values with exponential backoff
  let writeItemOutput = await asyncBatchWrite({
    RequestItems: { [ITEMS_TABLE]: itemTableRequests }
  });
  let backoffms = 100;
  while (writeItemOutput.UnprocessedItems &&
    Object.keys(writeItemOutput.UnprocessedItems).length
  ) {
    await new Promise(resolve => setTimeout(resolve, backoffms));
    backoffms *= 2;
    writeItemOutput = await asyncBatchWrite({
      RequestItems: writeItemOutput.UnprocessedItems
    });
  }

  return {
    uuid, createdBy: user, content, parentId, encryptionType, version, auth,
    iv, sig, createdAt
  };
}

export async function queryItems(params: IPaginateItemInput): Promise<IPaginatedItems> {
  const { username, /*parentId, */ encrypted, paginateKey } = params;
  const now = new Date();

  let day = now.toISOString().split("T")[0];
  let qKey: DocumentClient.Key | undefined;
  if (paginateKey) {
    day = paginateKey.day ? paginateKey.day : day;
    qKey = paginateKey.qKey ? paginateKey.qKey : qKey;
  }

  if (username) {
    // Get the user from the username, ignores parentId
    const { uuid: userId } = await getUserStubByUsername(username);
    if (!userId) {
      return { items: [], paginateKey: {} };
    }
    const creator = await getUserById(userId);
    const queryItemsOutput = await asyncQuery({
      TableName: ITEMS_TABLE,
      IndexName: "ItemCreatorIndex",
      KeyConditionExpression: "creator = :userId AND #depth = :depth",
      ExpressionAttributeValues: { ":userId": userId, ":depth": 0, ":sym": ENC_TYPE_SYM, ":asym": ENC_TYPE_ASYM },
      FilterExpression: encrypted === undefined ? undefined : "payload.encryptionType IN (:sym, :asym)",
      ProjectionExpression: "#uuid, payload",
      ExpressionAttributeNames: { "#uuid": "uuid", "#depth": "depth" }
    });
    const items: IItem[] = [];
    if (queryItemsOutput.Items) {
      for (const item of queryItemsOutput.Items) {
        const { uuid, payload } = item as IDynamoItem;
        items.push({ uuid, createdBy: creator, ...payload! });
      }
    }
    qKey = queryItemsOutput.LastEvaluatedKey;
    return { items, paginateKey: { day, qKey } };
  }

  if (username === undefined) {
    // username is undefined
    const queryItemsOutput = await asyncQuery({
      TableName: ITEMS_TABLE,
      IndexName: "ItemDayIndex",
      KeyConditionExpression: "createdAtDay = :day AND depth = :depth",
      ExpressionAttributeValues: { ":day": day, ":depth": 0 },
      ProjectionExpression: "#uuid, #depth, creator, ancestor, payload",
      ExpressionAttributeNames: { "#uuid": "uuid", "#depth": "depth" },
    });

    if (queryItemsOutput.Count) {
      // todo
    }
  }
  throw new Error("not implemented");
}
