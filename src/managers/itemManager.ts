import { AuthenticationError } from "apollo-server-core";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import uuidv4 from "uuid/v4";
import { ITEMS_TABLE } from "../constants";
import { ICreateItemInput, IItem } from "../graphql/schema";
import { docDbClient } from "../modules/dbClient";
import UserManager from "./userManager";
// import { IErrorMessage } from "../modules/validators";

interface IDynamoItem {
  uuid: string;
  depth: number; // 0 is self. 1 is child of parent, etc.
  creatorId: string;
  parentId?: string; // ancestor, undefined if depth is 0
  payload: {
    content: string;
    encryptionType?: "ASYMMETRIC" | "SYMMETRIC";
    version?: string;
    auth?: string;
    iv?: string;
    sig: string;
    createdAt: number;
  };
}

export default class ItemManager {
  public static async createItem(params: ICreateItemInput, userId?: string): Promise<IItem> {
    // const errors: IErrorMessage[] = [];
    if (!userId) {
      throw new AuthenticationError("User is not authenticated");
    }
    const user = await UserManager.getUserFromID(userId);

    const {
      content,
      parentId,
      encryptionType,
      version,
      auth,
      iv,
      sig
    } = params;

    const now = new Date().getTime();
    const itemId = uuidv4();
    const item: IItem = {
      uuid: itemId,
      createdBy: user,
      content,
      parentId,
      encryptionType,
      version,
      auth,
      iv,
      sig,
      createdAt: now
    };
    const dynamoItem: IDynamoItem = {
      uuid: itemId,
      depth: 0,
      parentId,
      creatorId: userId,
      payload: {
        content,
        encryptionType,
        version,
        auth,
        iv,
        sig,
        createdAt: now
      }
    };
    // perform verification of item
    const createItemParams: DocumentClient.PutItemInput = {
      TableName: ITEMS_TABLE,
      Item: dynamoItem
    };

    // TODO: update the closure for all nested items if parentId is set

    await new Promise<DocumentClient.PutItemOutput>((resolve, reject) =>
      docDbClient.put(createItemParams, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    );
    return item;
  }
}
