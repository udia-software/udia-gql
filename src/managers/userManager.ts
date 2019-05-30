import { UserInputError } from "apollo-server-core";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as uuidv5 from "uuid/v5";
import { USERS_TABLE, USERS_UUID_NS } from "../constants";
import { ICreateUserInput, IUserAuthParams, IUserAuthPayload } from "../graphql/schema";
import Auth from "../modules/auth";
import { client } from "../modules/dbClient";

export interface IErrorMessage {
  key: string;
  message: string;
}

export default class UserManager {
  public static MINIMUM_COST = 100000;

  public static async createUser(
    params: ICreateUserInput
  ): Promise<IUserAuthPayload> {
    const errors: IErrorMessage[] = [];
    const { username, pwFunc, pwFuncOptions, pwh } = params;
    const lUsername = UserManager.validateUsername(username, errors);
    const uuid = uuidv5(lUsername, USERS_UUID_NS);

    if (pwFunc !== "pbkdf2") {
      // validate client pasword derivation function is valid
      errors.push({ key: "pwFunc", message: "Only pbkdf2 supported." });
    } else if (pwFuncOptions.cost < this.MINIMUM_COST) {
      // validate cost is high enough
      errors.push({ key: "cost", message: `Cost is less than ${this.MINIMUM_COST}.` });
    } else {
      // validate username exists in db
      const output = await new Promise<DocumentClient.GetItemOutput>(
        (resolve, reject) =>
          client.get({
            TableName: USERS_TABLE,
            Key: { uuid },
            ProjectionExpression: "username"
          }, (err, data) => {
            if (err) { reject(err); } else { resolve(data); }
          })
      );
      if (output.Item) {
        errors.push({ key: "username", message: "Username is already taken." });
      }
    }

    // Hash the provided password hash secret, do not use client provided opts
    if (errors.length === 0) {
      const pwServerHash = await Auth.hashPassword(pwh);
      const createdAt = new Date().getTime();

      const saveUserParams: DocumentClient.PutItemInput = {
        TableName: USERS_TABLE,
        Item: { uuid, createdAt, username, pwFunc, pwFuncOptions, pwServerHash }
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
    const lUsername = UserManager.validateUsername(username, errors);
    const uuid = uuidv5(lUsername, USERS_UUID_NS);

    const checkUsernameParams: DocumentClient.GetItemInput = {
      TableName: USERS_TABLE,
      Key: { uuid },
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

  private static validateUsername(username: string, errors: IErrorMessage[]) {
    const lUsername = username.normalize("NFKC").toLowerCase().trim();
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
