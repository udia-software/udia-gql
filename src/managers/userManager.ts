/**
 * Persisting user information into DynamoDB
 */
import { UserInputError } from "apollo-server-core";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import uuidv4 from "uuid/v4";
import uuidv5 from "uuid/v5";
import {
  EMAILS_UUID_NS,
  ENCRYPT_UUID_NS,
  SIGN_UUID_NS,
  USERS_TABLE,
  USERS_UUID_NS
} from "../constants";
import {
  ICreateUserInput,
  IPwFuncOptions,
  ISignInUserInput,
  IUserAuthParams,
  IUserAuthPayload
} from "../graphql/schema";
import Auth from "../modules/auth";
import { docDbClient } from "../modules/dbClient";
import {
  IErrorMessage,
  isEmailValid,
  isUsernameValid
} from "../modules/validators";

type TYPE_USERNAME = 0;
type TYPE_EMAIL = 1;
type TYPE_SIGN_KEY = 2;
type TYPE_ENCRYPT_KEY = 3;

interface IDyanmoUsername {
  uuid: string;
  type: TYPE_USERNAME;
  payloadId: string; // username > NFKC > trim > lowercase > uuidv5
  payload: {
    username: string; // username > NFKC > trim
    createdAt: number; // epoch milliseconds
    pwFunc: string; // pbkdf2
    pwFuncOptions: IPwFuncOptions;
    pwServerHash: string; // argon2di output
  };
}

interface IDynamoEmail {
  uuid: string;
  type: TYPE_EMAIL;
  payloadId: string; // email > NFKC > trim > lowercase > uuidv5
  payload: {
    email: string; // // email > NFKC > trim
    isVerified: boolean;
    lastModifiedAt: number; // epoch ms
    verificationHash?: string; // argon2di output
  };
}

interface IDynamoKey {
  uuid: string;
  type: TYPE_SIGN_KEY | TYPE_ENCRYPT_KEY;
  payloadId: string; // publicKey > uuidv5
  payload: {
    publicKey: string; // base64 string
    encKeyPayload: {
      enc: string;
      nonce: string;
    };
  };
}

export default class UserManager {
  public static MINIMUM_COST = 100000;
  public static TYPE_USERNAME: TYPE_USERNAME = 0;
  public static TYPE_PRIMARY_EMAIL: TYPE_EMAIL = 1;
  public static TYPE_SIGN_KEY: TYPE_SIGN_KEY = 2;
  public static TYPE_ENCRYPT_KEY: TYPE_ENCRYPT_KEY = 3;

  public static async createUser(
    params: ICreateUserInput,
    uuid = uuidv4()
  ): Promise<IUserAuthPayload> {
    const errors: IErrorMessage[] = [];
    const {
      username,
      pwFunc,
      pwFuncOptions,
      pwh,
      email,
      signKeyPayload,
      encryptKeyPayload
    } = params;

    // perform verification & validation
    let valid = isUsernameValid(username, errors);
    valid = valid && this.isPwFuncMetaValid({ pwFunc, pwFuncOptions }, errors);
    const nUsername = username.normalize("NFKC").trim();
    const usernameId = uuidv5(nUsername.toLowerCase(), USERS_UUID_NS);
    valid = valid && (await this.isUsernameAvailable(usernameId, errors));

    const now = new Date().getTime();
    const rawBatchWriteActions: DocumentClient.WriteRequests = [];

    if (valid && email !== undefined) {
      // Optional email set, check if email parameter is valid
      valid = valid && isEmailValid(email, errors);
      valid = valid && (await this.isEmailAvailable(email, errors));
      if (valid) {
        const nEmail = email.normalize("NFKC").trim();
        const emailId = uuidv5(nEmail.toLowerCase(), EMAILS_UUID_NS);
        const emailPayloadAction: IDynamoEmail = {
          uuid,
          type: this.TYPE_PRIMARY_EMAIL,
          payloadId: emailId,
          payload: {
            email: nEmail,
            isVerified: false,
            lastModifiedAt: now
          }
        };
        rawBatchWriteActions.push({ PutRequest: { Item: emailPayloadAction } });
      }
    }

    if (valid) {
      // Persist sign and encryption key payloads
      const signKeyPayloadAction: IDynamoKey = {
        uuid,
        type: this.TYPE_SIGN_KEY,
        payloadId: uuidv5(signKeyPayload.publicKey, SIGN_UUID_NS),
        payload: signKeyPayload
      };
      rawBatchWriteActions.push({ PutRequest: { Item: signKeyPayloadAction } });

      const cryptKeyPayloadAction: IDynamoKey = {
        uuid,
        type: this.TYPE_ENCRYPT_KEY,
        payloadId: uuidv5(encryptKeyPayload.publicKey, ENCRYPT_UUID_NS),
        payload: encryptKeyPayload
      };
      rawBatchWriteActions.push({
        PutRequest: { Item: cryptKeyPayloadAction }
      });

      // Manage base username payload
      const pwServerHash = await Auth.hashPassword(pwh);
      const usernamePayloadAction: IDyanmoUsername = {
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
      rawBatchWriteActions.push({
        PutRequest: { Item: usernamePayloadAction }
      });
      const batchSaveUserParams = {
        RequestItems: { [USERS_TABLE]: rawBatchWriteActions }
      };
      // if no errors, save the user to the database
      await new Promise<DocumentClient.BatchWriteItemOutput>(
        (resolve, reject) =>
          docDbClient.batchWrite(batchSaveUserParams, (err, data) => {
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

  public static async signInUser(
    params: ISignInUserInput
  ): Promise<IUserAuthPayload> {
    const { username, pwh } = params;

    // Get the user from the database
    const lUsername = username
      .normalize("NFKC")
      .trim()
      .toLowerCase();
    const usernameId = uuidv5(lUsername, USERS_UUID_NS);
    const checkUsernameParams: DocumentClient.QueryInput = {
      TableName: USERS_TABLE,
      IndexName: "PayloadIndex",
      KeyConditionExpression: "payloadId = :usernameId",
      ExpressionAttributeValues: { ":usernameId": usernameId },
      ExpressionAttributeNames: { "#uuid": "uuid" },
      ProjectionExpression: "#uuid, payload"
    };
    const output = await new Promise<DocumentClient.QueryOutput>(
      (resolve, reject) =>
        docDbClient.query(checkUsernameParams, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        })
    );
    if (output.Count && output.Items) {
      const projection = output.Items[0];
      const serverHash = projection.payload.pwServerHash;
      const uuid = projection.uuid;
      if (await Auth.verifyPassword(serverHash, pwh)) {
        return {
          jwt: Auth.signUserJWT(uuid),
          user: {
            uuid,
            username: projection.payload.username,
            pwFunc: projection.payload.pwFunc,
            pwFuncOptions: projection.payload.PwFuncOptions,
            createdAt: projection.payload.createdAt
          }
        };
      }
    } else {
      throw new UserInputError("User does not exist", [
        { key: "username", message: "User does not exist." }
      ]);
    }
    throw new UserInputError("Incorrect password", [
      { key: "password", message: "Incorrect password." }
    ]);
  }

  public static async getUserAuthParams(
    username: string
  ): Promise<IUserAuthParams> {
    const errors: IErrorMessage[] = [];
    const lUsername = username
      .normalize("NFKC")
      .trim()
      .toLowerCase();
    const valid = isUsernameValid(lUsername, errors);
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
          docDbClient.query(checkUsernameParams, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
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

  public static async getUsername(uuid: string): Promise<string | undefined> {
    const getUsernameParams: DocumentClient.GetItemInput = {
      TableName: USERS_TABLE,
      Key: { uuid, type: this.TYPE_USERNAME },
      ProjectionExpression: "payload"
    };
    const output = await new Promise<DocumentClient.GetItemOutput>(
      (resolve, reject) =>
        docDbClient.get(getUsernameParams, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        })
    );
    if (output && output.Item) {
      return output.Item.payload.username;
    }
    return undefined;
  }

  private static async isEmailAvailable(
    email: string,
    errors: IErrorMessage[]
  ) {
    let isAvailable = true;
    const emailId = uuidv5(
      email
        .normalize("NFKC")
        .toLowerCase()
        .trim(),
      EMAILS_UUID_NS
    );
    const output = await new Promise<DocumentClient.QueryOutput>(
      (resolve, reject) =>
        docDbClient.query(
          {
            TableName: USERS_TABLE,
            IndexName: "PayloadIndex",
            KeyConditionExpression: "payloadId = :emailId",
            ExpressionAttributeValues: { ":emailId": emailId },
            ExpressionAttributeNames: { "#uuid": "uuid" },
            ProjectionExpression: "#uuid"
          },
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          }
        )
    );
    if (output.Count) {
      errors.push({ key: "email", message: "Email is already taken." });
      isAvailable = false;
    }
    return isAvailable;
  }

  private static async isUsernameAvailable(
    usernameId: string,
    errors: IErrorMessage[]
  ) {
    let isAvailable = true;
    const output = await new Promise<DocumentClient.QueryOutput>(
      (resolve, reject) =>
        docDbClient.query(
          {
            TableName: USERS_TABLE,
            IndexName: "PayloadIndex",
            KeyConditionExpression: "payloadId = :usernameId",
            ExpressionAttributeValues: { ":usernameId": usernameId },
            ExpressionAttributeNames: { "#uuid": "uuid" },
            ProjectionExpression: "#uuid"
          },
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          }
        )
    );
    if (output.Count) {
      errors.push({ key: "username", message: "Username is already taken." });
      isAvailable = false;
    }
    return isAvailable;
  }

  private static isPwFuncMetaValid(
    meta: { pwFunc: string; pwFuncOptions: IPwFuncOptions },
    errors: IErrorMessage[]
  ) {
    const { pwFunc, pwFuncOptions } = meta;
    let isValid = true;
    if (pwFunc !== "pbkdf2") {
      // validate client pasword derivation function is valid
      errors.push({ key: "pwFunc", message: "Only pbkdf2 supported." });
      isValid = false;
    } else if (pwFuncOptions.cost < this.MINIMUM_COST) {
      // validate cost is high enough
      errors.push({
        key: "cost",
        message: `Cost must be greater than ${this.MINIMUM_COST}.`
      });
      isValid = false;
    }
    return isValid;
  }
}
