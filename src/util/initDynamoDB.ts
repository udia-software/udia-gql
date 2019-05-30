// Helper script for initializing development & test DynamoDB tables
// tslint:disable: no-console
import { equal, notEqual } from "assert";
import { DynamoDB } from "aws-sdk";
import {
  DYNAMODB_ENDPOINT, DYNAMODB_KEY_ID, DYNAMODB_KEY_SECRET, DYNAMODB_REGION, DYNAMODB_STAGE, USERS_TABLE
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
    console.log(`\t${USERS_TABLE} already exists`);
  } else {
    await new Promise<DynamoDB.CreateTableOutput>((resolve, reject) =>
      client.createTable({
        TableName: USERS_TABLE,
        AttributeDefinitions: [{ AttributeName: "uuid", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "uuid", KeyType: "HASH" }],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
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
