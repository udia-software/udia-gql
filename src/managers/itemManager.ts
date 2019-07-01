import { DocumentClient } from "aws-sdk/clients/dynamodb";
import uuidv4 from "uuid/v4";
import { ITEMS_TABLE } from "../constants";
import { ICreateItemInput, IItem } from "../graphql/schema";
import { docDbClient } from "../modules/dbClient";
// import { IErrorMessage } from "../modules/validators";

interface IDynamoItem {
  uuid: string;
}

export default class ItemManager {
  public static async createItem(params: ICreateItemInput): Promise<IItem> {
    // const errors: IErrorMessage[] = [];
    const {
      payload,
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
      createdBy: undefined, // todo
      payload,
      parentId,
      encryptionType,
      version,
      auth,
      iv,
      sig,
      createdAt: now
    };
    const dynamoItem: IDynamoItem = {
      uuid: itemId
    }
    // perform verification of item
    const createItemParams: DocumentClient.PutItemInput = {
      TableName: ITEMS_TABLE,
      Item: dynamoItem
    };
    docDbClient.put(createItemParams);
    return item;
  }
}
