// Helper script for initializing development & test DynamoDB tables
// tslint:disable: no-console
import { equal, notEqual } from "assert";
import { DynamoDB } from "aws-sdk";
import {
  DYNAMODB_ENDPOINT, DYNAMODB_KEY_ID, DYNAMODB_KEY_SECRET, DYNAMODB_REGION, DYNAMODB_STAGE, ITEMS_TABLE, USERS_TABLE
} from "../constants";

async function main() {
  const config: DynamoDB.ClientConfiguration = {
    region: DYNAMODB_REGION,
    endpoint: DYNAMODB_ENDPOINT,
    credentials: {
      accessKeyId: DYNAMODB_KEY_ID,
      secretAccessKey: DYNAMODB_KEY_SECRET
    }
  };
  const client = new DynamoDB(config);

  console.log("DynamoDB Configuration =", config);
  // Assert we are only doing this for local dynamodb instance
  equal(DYNAMODB_ENDPOINT, "http://localhost:8000", "Local DynamoDB use only!");
  notEqual(DYNAMODB_STAGE, "prod", "Local DynamoDB use only!");

  console.log(`Initializing ${USERS_TABLE} ...`);
  const tables: DynamoDB.ListTablesOutput = await new Promise((resolve, reject) =>
    client.listTables({}, (err, data) => {
      if (err) { reject(err); } else { resolve(data); }
    })
  );
  if (tables.TableNames && tables.TableNames.includes(USERS_TABLE)) {
    console.log(`· ${USERS_TABLE} already exists`);
  } else {
    console.log(`· creating ${USERS_TABLE}`);
    await new Promise<DynamoDB.CreateTableOutput>((resolve, reject) =>
      client.createTable({
        TableName: USERS_TABLE,
        AttributeDefinitions: [
          { AttributeName: "uuid", AttributeType: "S" },
          { AttributeName: "type", AttributeType: "N" },
          { AttributeName: "payloadId", AttributeType: "S" }
        ],
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [
          { AttributeName: "uuid", KeyType: "HASH" },
          { AttributeName: "type", KeyType: "RANGE" }
        ],
        GlobalSecondaryIndexes: [{
          IndexName: "PayloadIndex",
          KeySchema: [
            { AttributeName: "payloadId", KeyType: "HASH" }
          ],
          Projection: {
            ProjectionType: "INCLUDE",
            NonKeyAttributes: ["uuid", "type", "payload"]
          }
        }]
      }, (err, data) => {
        if (err) { reject(err); } else { resolve(data); }
      })
    );
  }

  if (tables.TableNames && tables.TableNames.includes(ITEMS_TABLE)) {
    console.log(`· ${ITEMS_TABLE} already exists`);
  } else {
    console.log(`· creating ${ITEMS_TABLE}`);
    await new Promise<DynamoDB.CreateTableOutput>((resolve, reject) =>
      client.createTable({
        TableName: ITEMS_TABLE,
        AttributeDefinitions: [
          { AttributeName: "uuid", AttributeType: "S" },
          { AttributeName: "depth", AttributeType: "N" },
          { AttributeName: "userId", AttributeType: "S" }
        ],
        BillingMode: "PAY_PER_REQUEST",
        KeySchema: [
          { AttributeName: "uuid", KeyType: "HASH" },
          { AttributeName: "depth", KeyType: "RANGE" }
        ],
        GlobalSecondaryIndexes: [{
          IndexName: "UserIndex",
          KeySchema: [
            { AttributeName: "userId", KeyType: "HASH" }
          ],
          Projection: {
            ProjectionType: "INCLUDE",
            NonKeyAttributes: ["uuid", "depth", "payload"]
          }
        }]
      }, (err, data) => {
        if (err) { reject(err); } else { resolve(data); }
      })
    );
  }
}

if (require.main === module) {
  main().then(() => console.log("OK")).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
