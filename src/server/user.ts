/**
 * Functions for handling user data on the Server, DynamoDB opinionated
 * Called by the GraphQL resolvers and by express configuration
 */
import { AuthenticationError, UserInputError } from "apollo-server-core";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import uuidv4 from "uuid/v4";
import uuidv5 from "uuid/v5";
import { EMAILS_UUID_NS, ENCRYPT_UUID_NS, SIGN_UUID_NS, USERS_TABLE, USERS_UUID_NS } from "../constants";
import {
  ICreateUserInput, ICryptoKey, IPwFuncOptions, ISignInUserInput, IUser,
  IUserAuthParams, IUserAuthPayload
} from "../graphql/schema";
import Auth from "../modules/auth";
import { asyncBatchWrite, asyncGet, asyncQuery } from "../modules/dbClient";
import { IErrorMessage } from "../modules/validators";

export const MINIMUM_PBKDF2_COST = 100000;

const TYPE_USERNAME = 0;
const TYPE_SIGN_KEY = 1;
const TYPE_ENCRYPT_KEY = 2;
const TYPE_PRIMARY_EMAIL = 3;

// DynamoDB Item interfaces
interface IDynamoUsername {
  uuid: string;
  type: typeof TYPE_USERNAME;
  payloadId: string; // username > NFKC > trim > lowercase > uuidv5
  payload: {
    username: string; // username > NFKC > trim
    createdAt: number; // epoch milliseconds
    pwFunc: string; // pbkdf2
    pwFuncOptions: IPwFuncOptions;
    pwServerHash: string; // argon2di output
  };
}

interface IDynamoKey {
  uuid: string;
  type: typeof TYPE_SIGN_KEY | typeof TYPE_ENCRYPT_KEY;
  payloadId: string; // publicKey > uuidv5
  payload: ICryptoKey;
}

interface IDynamoEmail {
  uuid: string;
  type: typeof TYPE_PRIMARY_EMAIL;
  payloadId: string; // email > NFKC > trim > lowercase > uuidv5
  payload: {
    email: string; // // email > NFKC > trim
    isVerified: boolean;
    lastModifiedAt: number; // epoch ms
    verificationHash?: string; // argon2di output
  };
}

type DynamoUserItem = IDynamoUsername | IDynamoKey | IDynamoEmail;

export async function createUser(params: ICreateUserInput, uuid = uuidv4()): Promise<IUserAuthPayload> {
  const errors: IErrorMessage[] = [];
  const now = new Date().getTime();

  // perform verification & validation
  const { username, email, pwFunc, pwFuncOptions,
    signKeyPayload, encryptKeyPayload, pwh } = params;
  const nUsername = username.normalize("NFKC").trim();
  const usernameId = uuidv5(nUsername.toLowerCase(), USERS_UUID_NS);
  let valid = (
    isUsernameSyntaxOK(nUsername, errors) &&
    isPwFuncMetaOK({ pwFunc, pwFuncOptions }, errors) &&
    await isUsernameAvailable(usernameId, errors)
  );

  const userTableRequests: DocumentClient.WriteRequests = [];

  // If the optional email is provided, check email validity
  if (valid && email !== undefined) {
    const nEmail = email.normalize("NFKC").trim();
    const emailId = uuidv5(nEmail.toLowerCase(), EMAILS_UUID_NS);
    valid = isEmailSyntaxOK(nEmail, errors) && await isEmailAvailable(emailId, errors);
    if (valid) {
      const emailItem: IDynamoEmail = {
        uuid, type: TYPE_PRIMARY_EMAIL, payloadId: emailId,
        payload: { email: nEmail, isVerified: false, lastModifiedAt: now }
      };
      userTableRequests.push({ PutRequest: { Item: emailItem } });
    }
  }

  // if everything is valid, persist the user data
  if (valid) {
    const signKeyItem: IDynamoKey = {
      uuid, type: TYPE_SIGN_KEY,
      payloadId: uuidv5(signKeyPayload.publicKey, SIGN_UUID_NS),
      payload: signKeyPayload
    };
    userTableRequests.push({ PutRequest: { Item: signKeyItem } });
    const encryptKeyItem: IDynamoKey = {
      uuid, type: TYPE_ENCRYPT_KEY,
      payloadId: uuidv5(encryptKeyPayload.publicKey, ENCRYPT_UUID_NS),
      payload: encryptKeyPayload
    };
    userTableRequests.push({ PutRequest: { Item: encryptKeyItem } });
    const usernameItem: IDynamoUsername = {
      uuid, type: TYPE_USERNAME, payloadId: usernameId, payload: {
        username: nUsername, createdAt: now, pwFunc, pwFuncOptions,
        pwServerHash: await Auth.hashPassword(pwh)
      }
    };
    userTableRequests.push({ PutRequest: { Item: usernameItem } });

    // Persist the values with exponential backoff
    let writeUserOutput = await asyncBatchWrite({
      RequestItems: { [USERS_TABLE]: userTableRequests }
    });
    let backoffms = 100;
    while (
      writeUserOutput.UnprocessedItems &&
      Object.keys(writeUserOutput.UnprocessedItems).length
    ) {
      await new Promise(resolve => setTimeout(resolve, backoffms));
      backoffms *= 2;
      writeUserOutput = await asyncBatchWrite({
        RequestItems: writeUserOutput.UnprocessedItems
      });
    }

    return {
      jwt: Auth.signUserJWT(uuid),
      user: {
        uuid, username: nUsername, pwFunc, pwFuncOptions, signKeyPayload,
        encryptKeyPayload, createdAt: now
      }
    };
  } else {
    throw new UserInputError("Failed to create User", errors);
  }
}

export async function signInUser({ username, pwh }: ISignInUserInput): Promise<IUserAuthPayload> {
  const nUsername = username.normalize("NFKC").trim();
  const usernameId = uuidv5(nUsername.toLowerCase(), USERS_UUID_NS);
  const queryByUsername = await asyncQuery({
    TableName: USERS_TABLE,
    IndexName: "UserPayloadIndex",
    KeyConditionExpression: "payloadId = :usernameId",
    ExpressionAttributeValues: { ":usernameId": usernameId },
    ProjectionExpression: "#uuid, payload",
    ExpressionAttributeNames: { "#uuid": "uuid" }
  });
  if (!queryByUsername.Count || !queryByUsername.Items) {
    throw new UserInputError("User does not exist", [{ key: "username", message: "User does not exist." }]);
  }
  const userItem: IDynamoUsername = queryByUsername.Items[0] as IDynamoUsername;
  const { uuid, payload: { pwServerHash } } = userItem;
  if (!(await Auth.verifyPassword(pwServerHash, pwh))) {
    throw new UserInputError("Incorrect password", [{ key: "password", message: "Incorrect password." }]);
  }
  return {
    jwt: Auth.signUserJWT(uuid),
    user: await getUserById(uuid)
  };
}

export async function getUserAuthParams(username: string): Promise<IUserAuthParams> {
  const { pwFunc, pwFuncOptions } = await getUserStubByUsername(username);
  if (pwFunc && pwFuncOptions) {
    return { pwFunc, pwFuncOptions };
  }
  throw new UserInputError("User does not exist", [{ key: "username", message: "User does not exist." }]);
}

export async function getUserStubByUsername(qUsername: string): Promise<Partial<IUser>> {
  const nUsername = qUsername.normalize("NFKC").trim();
  if (isUsernameSyntaxOK(nUsername, [])) {
    const usernameId = uuidv5(nUsername.toLowerCase(), USERS_UUID_NS);
    const queryUsernameOutput = await asyncQuery({
      TableName: USERS_TABLE,
      IndexName: "UserPayloadIndex",
      KeyConditionExpression: "payloadId = :usernameId",
      ExpressionAttributeValues: { ":usernameId": usernameId },
      ProjectionExpression: "payload"
    });
    if (queryUsernameOutput.Count && queryUsernameOutput.Items) {
      const { uuid,
        payload: { pwFunc, pwFuncOptions, username, createdAt }
      } = queryUsernameOutput.Items[0] as IDynamoUsername;
      return { uuid, username, pwFunc, pwFuncOptions, createdAt };
    }
  }
  return {};
}

export async function getUserById(uuid: string): Promise<IUser> {
  const getUserOutput = await asyncQuery({
    TableName: USERS_TABLE,
    KeyConditionExpression: "#uuid = :uuid AND #type BETWEEN :usernameType AND :encKeyType",
    ExpressionAttributeNames: { "#uuid": "uuid", "#type": "type" },
    ExpressionAttributeValues: { ":uuid": uuid, ":encKeyType": TYPE_ENCRYPT_KEY, ":usernameType": TYPE_USERNAME },
    ProjectionExpression: "#type, payload"
  });
  if (!getUserOutput.Count || !getUserOutput.Items) {
    throw new AuthenticationError("User key store broken");
  }
  const user: Partial<IUser> = { uuid };
  for (const item of getUserOutput.Items) {
    switch ((item as DynamoUserItem).type) {
      case TYPE_USERNAME:
        const { payload: { username, createdAt, pwFunc, pwFuncOptions } } = item as IDynamoUsername;
        user.username = username;
        user.createdAt = createdAt;
        user.pwFunc = pwFunc;
        user.pwFuncOptions = pwFuncOptions;
        break;
      case TYPE_SIGN_KEY:
        user.signKeyPayload = (item as IDynamoKey).payload;
        break;
      case TYPE_ENCRYPT_KEY:
        user.encryptKeyPayload = (item as IDynamoKey).payload;
        break;
      default:
        throw new AuthenticationError("User key store broken");
    }
  }
  return user as IUser;
}

export async function seedCookiePayload(uuid: string): Promise<Partial<IUser>> {
  const output = await asyncGet({
    TableName: USERS_TABLE,
    Key: { uuid, type: TYPE_USERNAME },
    ProjectionExpression: "payload"
  });
  if (output.Item) {
    const { payload: { username } } = output.Item as IDynamoUsername;
    return { username };
  }
  return {};
}

export async function isEmailAvailable(emailId: string, errors: IErrorMessage[]) {
  let isAvailable = true;
  const output = await asyncQuery({
    TableName: USERS_TABLE,
    IndexName: "UserPayloadIndex",
    KeyConditionExpression: "payloadId = :emailId",
    ExpressionAttributeValues: { ":emailId": emailId },
    ProjectionExpression: "#uuid",
    ExpressionAttributeNames: { "#uuid": "uuid" }
  });
  if (output.Count) {
    errors.push({ key: "email", message: "Email is unavailable." });
    isAvailable = false;
  }
  return isAvailable;
}

export function isEmailSyntaxOK(noramlizedEmail: string, errors: IErrorMessage[]) {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(noramlizedEmail);
  if (!isValid) {
    errors.push({ key: "email", message: "Email is syntactically invalid." });
  }
  return isValid;
}

export async function isUsernameAvailable(
  usernameId: string, errors: IErrorMessage[]
) {
  let isAvailable = true;
  const output = await asyncQuery({
    TableName: USERS_TABLE,
    IndexName: "UserPayloadIndex",
    KeyConditionExpression: "payloadId = :usernameId",
    ExpressionAttributeValues: { ":usernameId": usernameId },
    ProjectionExpression: "#uuid",
    ExpressionAttributeNames: { "#uuid": "uuid" }
  });
  if (output.Count) {
    errors.push({ key: "username", message: "Username is unavailable." });
    isAvailable = false;
  }
  return isAvailable;
}

export function isPwFuncMetaOK(
  params: { pwFunc: string, pwFuncOptions: ICreateUserInput["pwFuncOptions"] },
  errors: IErrorMessage[]
) {
  let isValid = true;
  if (params.pwFunc !== "pbkdf2") {
    errors.push({
      key: "pwFunc",
      message: "Only 'pbkdf2' currently supported."
    });
    isValid = false;
  }
  if (params.pwFuncOptions.cost < MINIMUM_PBKDF2_COST) {
    errors.push({
      key: "pwFuncOptions.cost",
      message: `Iterations of 'pbkdf2' must exceed ${MINIMUM_PBKDF2_COST}.`
    });
    isValid = false;
  }
  return isValid;
}

export function isUsernameSyntaxOK(normalizedUsername: string, errors: IErrorMessage[]) {
  let isValid = true;
  if (normalizedUsername.length > 24) {
    errors.push({
      key: "username",
      message: "Username is too long (over 24 characters)."
    });
    isValid = false;
  } else if (normalizedUsername.length < 3) {
    errors.push({
      key: "username",
      message: "Username is too short (under 3 characters)."
    });
    isValid = false;
  }
  if (RegExp("\\s", "g").test(normalizedUsername)) {
    errors.push({
      key: "username",
      message: "Username should not contain whitespace."
    });
    isValid = false;
  }
  if (normalizedUsername.indexOf("@") >= 0) {
    errors.push({
      key: "username",
      message: "Username should not contain '@' symbol."
    });
  }
  return isValid;
}
