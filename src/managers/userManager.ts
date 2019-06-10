import { UserInputError } from "apollo-server-core";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import uuidv5 from "uuid/v5";
import { USERS_TABLE, USERS_UUID_NS } from "../constants";
import { ICreateUserInput, IPwFuncOptions, IUserAuthParams, IUserAuthPayload } from "../graphql/schema";
import Auth from "../modules/auth";
import { client } from "../modules/dbClient";

export interface IErrorMessage {
  key: string;
  message: string;
}

interface IDyanmoUsername {
  uuid: string;
  type: number;
  payload: string; // username
  createdAt: number; // epoch milliseconds
  pwFunc: string; // pbkdf2
  pwFuncOptions: IPwFuncOptions;
  pwServerHash: string; // argon2di output
}

/**
 * DynamoDB wrapper for persisting user information
 */
export default class UserManager {
  public static MINIMUM_COST = 100000;
  public static TYPE_USERNAME = 0;
  public static TYPE_PRIMARY_EMAIL = 1;

  public static async createUser(
    params: ICreateUserInput
  ): Promise<IUserAuthPayload> {
    const errors: IErrorMessage[] = [];
    const { username, pwFunc, pwFuncOptions, pwh, email } = params;
    const lUsername = username.normalize("NFKC").toLowerCase().trim();
    const uuid = uuidv5(lUsername, USERS_UUID_NS);

    if (UserManager.isUsernameValid(lUsername, errors) &&
      UserManager.isPwFuncMetaValid({ pwFunc, pwFuncOptions }, errors) &&
      await UserManager.isUsernameAvailable(uuid, errors) &&
      email !== undefined
    ) {
      // Optional email set, check if email parameter is valid
      if (UserManager.isEmailValid(email, errors)) {
        // check if email already exists
        // tslint:disable-next-line: no-console
        console.log("todo");
      }
    }

    // Hash the provided password hash secret, do not use client provided opts
    if (errors.length === 0) {
      const pwServerHash = await Auth.hashPassword(pwh);
      const createdAt = new Date().getTime();
      const usernamePayload: IDyanmoUsername = {
        uuid,
        type: this.TYPE_USERNAME,
        payload: username,
        createdAt,
        pwFunc,
        pwFuncOptions,
        pwServerHash
      };

      const saveUserParams: DocumentClient.PutItemInput = {
        TableName: USERS_TABLE,
        Item: usernamePayload
      };

      // if no errors, save the user to the database
      await new Promise<DocumentClient.PutItemOutput>(
        (resolve, reject) =>
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
          pwFuncOptions,
          createdAt
        }
      };
    } else {
      throw new UserInputError("Failed to create User", errors);
    }
  }

  public static async getUserAuthParams(username: string): Promise<IUserAuthParams> {
    const errors: IErrorMessage[] = [];
    const lUsername = username.normalize("NFKC").toLowerCase().trim();
    UserManager.isUsernameValid(lUsername, errors);
    const uuid = uuidv5(lUsername, USERS_UUID_NS);

    const checkUsernameParams: DocumentClient.GetItemInput = {
      TableName: USERS_TABLE,
      Key: { uuid, type: this.TYPE_USERNAME },
      ProjectionExpression: "pwFunc, pwFuncOptions"
    };
    const output = await new Promise<DocumentClient.GetItemOutput>(
      (resolve, reject) =>
        client.get(checkUsernameParams, (err, data) => {
          if (err) { reject(err); } else { resolve(data); }
        })
    );
    if (output.Item) {
      return {
        pwFunc: output.Item.pwFunc,
        pwFuncOptions: output.Item.pwFuncOptions
      };
    } else {
      throw new UserInputError("User does not exist", [
        { key: "username", message: "User does not exist." }
      ]);
    }
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

  private static async isUsernameAvailable(uuid: string, errors: IErrorMessage[]) {
    let isAvailable = true;
    const output = await new Promise<DocumentClient.GetItemOutput>((resolve, reject) => client.get({
      TableName: USERS_TABLE,
      Key: { uuid, type: this.TYPE_USERNAME },
      ProjectionExpression: "payload"
    }, (err, data) => {
      if (err) { reject(err); } else { resolve(data); }
    }));
    if (output.Item) {
      errors.push({ key: "username", message: "Username is already taken." });
      isAvailable = false;
    }
    return isAvailable;
  }

  private static isUsernameValid(lUsername: string, errors: IErrorMessage[]) {
    let isValid = true;
    if (lUsername.length > 24) {
      errors.push({
        key: "username",
        message: "Username is too long (over 24 characters)."
      });
      isValid = false;
    } else if (lUsername.length < 3) {
      errors.push({
        key: "username",
        message: "Username is too short (under 3 characters)."
      });
      isValid = false;
    }
    if (RegExp("\\s", "g").test(lUsername)) {
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
