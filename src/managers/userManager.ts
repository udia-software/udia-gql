/**
 * Persisting user information into DynamoDB
 */
import { UserInputError } from "apollo-server-core";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import uuidv4 from "uuid/v4";
import uuidv5 from "uuid/v5";
import { EMAILS_UUID_NS, USERS_TABLE, USERS_UUID_NS } from "../constants";
import { ICreateUserInput, IPwFuncOptions, IUserAuthParams, IUserAuthPayload } from "../graphql/schema";
import Auth from "../modules/auth";
import { client } from "../modules/dbClient";

export interface IErrorMessage {
  key: string;
  message: string;
}

type TYPE_USERNAME = 0;
type TYPE_EMAIL = 1;

export interface IDyanmoUsername {
  uuid: string;
  type: TYPE_USERNAME;
  payloadId: string; // username > NFKC > lowercase > uuidv5
  payload: {
    username: string;
    createdAt: number; // epoch milliseconds
    pwFunc: string; // pbkdf2
    pwFuncOptions: IPwFuncOptions;
    pwServerHash: string; // argon2di output
  };
}

interface IDynamoEmail {
  uuid: string;
  type: TYPE_EMAIL;
  payloadId: string;
  payload: {
    email: string;
    isVerified: boolean;
    lastModifiedAt: number; // epoch ms
    verificationHash?: string // argon2di output
  };
}

export default class UserManager {
  public static MINIMUM_COST = 100000;
  public static TYPE_USERNAME: TYPE_USERNAME = 0;
  public static TYPE_PRIMARY_EMAIL: TYPE_EMAIL = 1;

  public static async createUser(
    params: ICreateUserInput,
    uuid = uuidv4(),
  ): Promise<IUserAuthPayload> {
    const errors: IErrorMessage[] = [];
    const { username, pwFunc, pwFuncOptions, pwh, email } = params;

    // perform verification & validation
    let valid = this.isUsernameValid(username, errors);
    valid = valid && this.isPwFuncMetaValid({ pwFunc, pwFuncOptions }, errors);
    const nUsername = username.normalize("NFKC").trim();
    const usernameId = uuidv5(nUsername.toLowerCase(), USERS_UUID_NS);
    valid = valid && await this.isUsernameAvailable(usernameId, errors);

    const now = new Date().getTime();
    const rawBatchWriteActions: DocumentClient.WriteRequests = [];

    if (valid && email !== undefined) {
      // Optional email set, check if email parameter is valid
      valid = valid && this.isEmailValid(email, errors);
      valid = valid && await this.isEmailAvailable(email, errors);
      if (valid) {
        const nEmail = email.normalize("NFKC").trim();
        const emailId = uuidv5(nEmail.toLowerCase(), EMAILS_UUID_NS);
        const emailPayload: IDynamoEmail = {
          uuid,
          type: this.TYPE_PRIMARY_EMAIL,
          payloadId: emailId,
          payload: {
            email: nEmail,
            isVerified: false,
            lastModifiedAt: now
          }
        };
        rawBatchWriteActions.push({ PutRequest: { Item: emailPayload } });
      }
    }

    if (valid) {
      const pwServerHash = await Auth.hashPassword(pwh);
      const usernamePayload: IDyanmoUsername = {
        uuid,
        type: this.TYPE_USERNAME,
        payloadId: usernameId,
        payload: {
          username: nUsername,
          createdAt: now,
          pwFunc,
          pwFuncOptions,
          pwServerHash
        }
      };
      rawBatchWriteActions.push({ PutRequest: { Item: usernamePayload } });
      const batchSaveUserParams: DocumentClient.BatchWriteItemInput = {
        RequestItems: { [USERS_TABLE]: rawBatchWriteActions }
      };
      // if no errors, save the user to the database
      await new Promise<DocumentClient.BatchWriteItemOutput>(
        (resolve, reject) =>
          client.batchWrite(batchSaveUserParams, (err, data) => {
            if (err) { reject(err); } else { resolve(data); }
          })
      );

      return {
        jwt: Auth.signUserJWT(uuid),
        user: {
          uuid,
          username: nUsername,
          pwFunc,
          pwFuncOptions,
          createdAt: now
        }
      };
    } else {
      throw new UserInputError("Failed to create User", errors);
    }
  }

  public static async getUserAuthParams(username: string): Promise<IUserAuthParams> {
    const errors: IErrorMessage[] = [];
    const lUsername = username.normalize("NFKC").trim().toLowerCase();
    const valid = UserManager.isUsernameValid(lUsername, errors);
    if (valid) {
      const usernameId = uuidv5(lUsername, USERS_UUID_NS);
      const checkUsernameParams: DocumentClient.QueryInput = {
        TableName: USERS_TABLE,
        IndexName: "PayloadIndex",
        KeyConditionExpression: "payloadId = :usernameId",
        ExpressionAttributeValues: { ":usernameId": usernameId },
        ProjectionExpression: "payload"
      };
      const output = await new Promise<DocumentClient.QueryOutput>(
        (resolve, reject) =>
          client.query(checkUsernameParams, (err, data) => {
            if (err) { reject(err); } else { resolve(data); }
          })
      );
      if (output.Count && output.Items) {
        const projection = output.Items[0];
        return {
          pwFunc: projection.payload.pwFunc,
          pwFuncOptions: projection.payload.pwFuncOptions
        };
      }
    }
    throw new UserInputError("User does not exist", [
      { key: "username", message: "User does not exist." }
    ]);
  }

  private static async isEmailAvailable(email: string, errors: IErrorMessage[]) {
    let isAvailable = true;
    const emailId = uuidv5(email.normalize("NFKC").toLowerCase().trim(), EMAILS_UUID_NS);
    const output = await new Promise<DocumentClient.QueryOutput>((resolve, reject) => client.query({
      TableName: USERS_TABLE,
      IndexName: "PayloadIndex",
      KeyConditionExpression: "payloadId = :emailId",
      ExpressionAttributeValues: { ":emailId": emailId },
      ExpressionAttributeNames: { "#uuid": "uuid" },
      ProjectionExpression: "#uuid"
    }, (err, data) => {
      if (err) { reject(err); } else { resolve(data); }
    }));
    if (output.Count) {
      errors.push({ key: "email", message: "Email is already taken." });
      isAvailable = false;
    }
    return isAvailable;
  }

  private static isEmailValid(email: string, errors: IErrorMessage[]) {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      errors.push({
        key: "email", message: "Email is syntactically invalid."
      });
    }
    return isValid;
  }

  private static async isUsernameAvailable(usernameId: string, errors: IErrorMessage[]) {
    let isAvailable = true;
    const output = await new Promise<DocumentClient.QueryOutput>((resolve, reject) => client.query({
      TableName: USERS_TABLE,
      IndexName: "PayloadIndex",
      KeyConditionExpression: "payloadId = :usernameId",
      ExpressionAttributeValues: { ":usernameId": usernameId },
      ExpressionAttributeNames: { "#uuid": "uuid" },
      ProjectionExpression: "#uuid"
    }, (err, data) => {
      if (err) { reject(err); } else { resolve(data); }
    }));
    if (output.Count) {
      errors.push({ key: "username", message: "Username is already taken." });
      isAvailable = false;
    }
    return isAvailable;
  }

  private static isUsernameValid(username: string, errors: IErrorMessage[]) {
    const nUsername = username.normalize("NFKC").trim();
    let isValid = true;
    if (nUsername.length > 24) {
      errors.push({
        key: "username",
        message: "Username is too long (over 24 characters)."
      });
      isValid = false;
    } else if (nUsername.length < 3) {
      errors.push({
        key: "username",
        message: "Username is too short (under 3 characters)."
      });
      isValid = false;
    }
    if (RegExp("\\s", "g").test(nUsername)) {
      errors.push({
        key: "username",
        message: "Username should not contain whitespace."
      });
      isValid = false;
    }
    return isValid;
  }

  private static isPwFuncMetaValid(meta: { pwFunc: string, pwFuncOptions: IPwFuncOptions }, errors: IErrorMessage[]) {
    const { pwFunc, pwFuncOptions } = meta;
    let isValid = true;
    if (pwFunc !== "pbkdf2") {
      // validate client pasword derivation function is valid
      errors.push({ key: "pwFunc", message: "Only pbkdf2 supported." });
      isValid = false;
    } else if (pwFuncOptions.cost < this.MINIMUM_COST) {
      // validate cost is high enough
      errors.push({ key: "cost", message: `Cost must be greater than ${this.MINIMUM_COST}.` });
      isValid = false;
    }
    return isValid;
  }
}
