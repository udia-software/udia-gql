import { DynamoDB } from "aws-sdk";
import { ICreateUser, IUserAuthPayload } from "./schema";
import { USERS_TABLE, DYNAMODB_ENDPOINT } from "./constants";
import Auth from "./auth"
import * as uuidv5 from "uuid/v5";
import { UserInputError } from "apollo-server-core";

export interface IErrorMessage {
  key: string;
  message: string;
}

export default class UserManager {
  private static UUID_NAMESPACE = "1d1a2d1a-3d1a-4d1a-5d1a-6d1a7d1a8d1a";

  public static async createUser(params: ICreateUser): Promise<IUserAuthPayload> {
    const errors: IErrorMessage[] = [];
    const { username, pwFunc, pwFuncOpts, pwh } = params;
    const lUsername = UserManager.validateUsername(username, errors);
    const uuid = uuidv5(lUsername, this.UUID_NAMESPACE)

    // validate username exists in db
    const client = new DynamoDB.DocumentClient({ endpoint: DYNAMODB_ENDPOINT || undefined });
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
    const output = await new Promise<DynamoDB.DocumentClient.QueryOutput>((resolve, reject) =>
      client.query(checkUsernameParams, (err, data) => {
        if (err) { reject(err); } else { resolve(data); }
      })
    );
    if (output.Count! > 0) {
      errors.push({
        key: "username",
        message: "Username is already taken"
      });
    }

    // Hash the provided password hash secret, do not use client provided opts
    if (errors.length == 0) {
      const pwServerHash = await Auth.hashPassword(pwh);
      const createdAt = new Date().getTime();

      const saveUserParams: DynamoDB.DocumentClient.PutItemInput = {
        TableName: USERS_TABLE,
        Item: {
          uuid,
          createdAt,
          username,
          pwFunc,
          pwFuncOpts,
          pwServerHash
        }
      }

      // if no errors, save the user to the database
      await new Promise<DynamoDB.DocumentClient.PutItemOutput>((resolve, reject) =>
        client.put(saveUserParams, (err, data) => {
          if (err) { reject(err); } else { resolve(data); }
        })
      );

      return {
        jwt: Auth.signUserJWT(uuid),
        user: {
          uuid,
          username,
          pwFunc,
          pwFuncOptions: pwFuncOpts,
          createdAt
        }
      };
    } else {
      throw new UserInputError("Failed to create User", errors);
    }
  }

  private static validateUsername(username: string, errors: IErrorMessage[]) {
    const lUsername = username.normalize("NFKC").toLowerCase().trim();
    if (lUsername.length > 24) {
      errors.push({
        key: "username",
        message: "Username is too long (over 24 characters)."
      });
    }
    else if (lUsername.length < 3) {
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
