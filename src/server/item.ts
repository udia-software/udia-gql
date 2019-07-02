import { AuthenticationError } from "apollo-server-core";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import uuidv4 from "uuid/v4";
import { ITEMS_TABLE } from "../constants";
import { ICreateItemInput, IItem } from "../graphql/schema";
import { asyncBatchWrite, asyncQuery } from "../modules/dbClient";
import { getUserById } from "./user";

interface IDynamoItem {
  uuid: string;
  depth: number; // 0 = self, 1 = ancestor child, 2 = ancestor grandchild, etc.
  ancestor?: string; // closure, undefined if depth is 0, otherwise item uuid
  creator: string; // creator user's uuid
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
  const now = new Date().getTime();

  const { parentId, content, sig, encryptionType, version, auth, iv } = params;
  const newItem: IDynamoItem = {
    uuid, depth: 0, creator: userId, payload: {
      content, sig, encryptionType, version, auth, iv, createdAt: now
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
          const closureItem: IDynamoItem = { uuid, depth: depth + 1, ancestor, creator: userId };
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
    iv, sig, createdAt: now
  };
}
