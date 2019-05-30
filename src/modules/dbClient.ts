import { DynamoDB } from "aws-sdk";
import { DYNAMODB_ENDPOINT, DYNAMODB_KEY_ID, DYNAMODB_KEY_SECRET, DYNAMODB_REGION, DYNAMODB_STAGE } from "../constants";

export const client = new DynamoDB.DocumentClient({
  region: DYNAMODB_REGION,
  endpoint: DYNAMODB_ENDPOINT,
  credentials: DYNAMODB_STAGE === "prod" ?
  /* istanbul ignore next */ undefined : {
    accessKeyId: DYNAMODB_KEY_ID,
    secretAccessKey: DYNAMODB_KEY_SECRET
  }
});
