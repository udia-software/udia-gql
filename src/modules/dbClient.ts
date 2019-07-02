import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { DYNAMODB_ENDPOINT, DYNAMODB_KEY_ID, DYNAMODB_KEY_SECRET, DYNAMODB_REGION, DYNAMODB_STAGE } from "../constants";

export const docDbClient = new DocumentClient({
  region: DYNAMODB_REGION,
  endpoint: DYNAMODB_ENDPOINT,
  credentials: DYNAMODB_STAGE === "prod" ?
  /* istanbul ignore next */ undefined : {
      accessKeyId: DYNAMODB_KEY_ID,
      secretAccessKey: DYNAMODB_KEY_SECRET
    }
});

export const asyncGet = async (
  params: DocumentClient.GetItemInput
): Promise<DocumentClient.GetItemOutput> =>
  await new Promise((resolve, reject) => {
    docDbClient.get(params, (err, data) => {
      if (err) { reject(err); } else { resolve(data); }
    });
  });

export const asyncPut = async (
  params: DocumentClient.PutItemInput
): Promise<DocumentClient.PutItemOutput> =>
  await new Promise((resolve, reject) =>
    docDbClient.put(params, (err, data) => {
      if (err) { reject(err); } else { resolve(data); }
    })
  );

export const asyncQuery = async (
  params: DocumentClient.QueryInput
): Promise<DocumentClient.QueryOutput> =>
  await new Promise((resolve, reject) =>
    docDbClient.query(params, (err, data) => {
      if (err) { reject(err); } else { resolve(data); }
    })
  );

export const asyncBatchWrite = async (
  params: DocumentClient.BatchWriteItemInput
): Promise<DocumentClient.BatchWriteItemOutput> =>
  await new Promise((resolve, reject) =>
    docDbClient.batchWrite(params, (err, data) => {
      if (err) { reject(err); } else { resolve(data); }
    })
  );
