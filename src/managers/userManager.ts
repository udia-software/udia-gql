import { UserInputError } from "apollo-server-core";
import { DynamoDB } from "aws-sdk";
import * as uuidv5 from "uuid/v5";
import { DYNAMODB_ENDPOINT, DYNAMODB_KEY_ID, DYNAMODB_KEY_SECRET, DYNAMODB_REGION, USERS_TABLE } from "../constants";
import { ICreateUserInput, IUserAuthPayload } from "../graphql/schema";
import Auth from "../modules/auth";

export interface IErrorMessage {
  key: string;
  message: string;
}

const client = new DynamoDB.DocumentClient({
  region: DYNAMODB_REGION,
  endpoint: DYNAMODB_ENDPOINT,
  credentials: DYNAMODB_REGION === "dev" ? {
    accessKeyId: DYNAMODB_KEY_ID,
    secretAccessKey: DYNAMODB_KEY_SECRET
  } : undefined
});

export default class UserManager {
  public static async createUser(
    params: ICreateUserInput
  ): Promise<IUserAuthPayload> {
    const errors: IErrorMessage[] = [];
    const { username, pwFunc, pwFuncOptions, pwh } = params;
    const lUsername = UserManager.validateUsername(username, errors);
    const uuid = uuidv5(lUsername, this.UUID_NAMESPACE);

    // validate username exists in db
    const checkUsernameParams: DynamoDB.DocumentClient.QueryInput = {
      TableName: USERS_TABLE,
      KeyConditionExpression: "#uuid = :uuid",
      ExpressionAttributeNames: {
        "#uuid": "uuid"
      },
      ExpressionAttributeValues: {
        ":uuid": uuid
      }
    };
    const output = await new Promise<DynamoDB.DocumentClient.QueryOutput>(
      (resolve, reject) =>
        client.query(checkUsernameParams, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        })
    );
    if (output.Count! > 0) {
      errors.push({
        key: "username",
        message: "Username is already taken"
      });
    }

    // Hash the provided password hash secret, do not use client provided opts
    if (errors.length === 0) {
      const pwServerHash = await Auth.hashPassword(pwh);
      const createdAt = new Date().getTime();

      const saveUserParams: DynamoDB.DocumentClient.PutItemInput = {
        TableName: USERS_TABLE,
        Item: {
          uuid,
          createdAt,
          username,
          pwFunc,
          pwFuncOptions,
          pwServerHash
        }
      };

      // if no errors, save the user to the database
      await new Promise<DynamoDB.DocumentClient.PutItemOutput>(
        (resolve, reject) =>
          client.put(saveUserParams, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          })
      );

      return {
        jwt: Auth.signUserJWT(uuid),
        user: {
          uuid,
          username,
          pwFunc,
          pwFuncOptions,
          createdAt
        }
      };
    } else {
      throw new UserInputError("Failed to create User", errors);
    }
  }

  public static async getUserAuthParams(username: string) {
    const errors: IErrorMessage[] = [];
    const lUsername = UserManager.validateUsername(username, errors);
    const uuid = uuidv5(lUsername, this.UUID_NAMESPACE);

    const checkUsernameParams: DynamoDB.DocumentClient.GetItemInput = {
      TableName: USERS_TABLE,
      Key: { uuid },
      ProjectionExpression: "pwFunc, pwFuncOpts"
    };
    const output = await new Promise<DynamoDB.DocumentClient.GetItemOutput>(
      (resolve, reject) =>
        client.get(checkUsernameParams, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        })
    );
    if (output.Item) {
      return {
        pwFunc: output.Item.pwFunc.S,
        pwFuncOpts: {
          salt: output.Item.pwFuncOptions.salt.S,
          memory: output.Item.pwFuncOptions.memory.N,
          iterations: output.Item.pwFuncOptions.iterations.N,
          hashLength: output.Item.pwFuncOptions.hashLength.N,
          parallelism: output.Item.pwFuncOptions.parallelism.N,
          type: output.Item.pwFuncOptions.type.N
        }
      };
    } else {
      throw new UserInputError("User does not exist", [
        { key: "username", message: "User does not exist." }
      ]);
    }
  }

  private static UUID_NAMESPACE = "1d1a2d1a-3d1a-4d1a-5d1a-6d1a7d1a8d1a";
  private static validateUsername(username: string, errors: IErrorMessage[]) {
    const lUsername = username
      .normalize("NFKC")
      .toLowerCase()
      .trim();
    if (lUsername.length > 24) {
      errors.push({
        key: "username",
        message: "Username is too long (over 24 characters)."
      });
    } else if (lUsername.length < 3) {
      errors.push({
        key: "username",
        message: "Username is too short (under 3 characters)."
      });
    }
    // validate username whitespace
    if (RegExp("\\s", "g").test(lUsername)) {
      errors.push({
        key: "username",
        message: "Username should not contain whitespace."
      });
    }
    return lUsername;
  }
}
