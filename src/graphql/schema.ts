import { gql } from "apollo-server-lambda";
import { ICryptPayload } from "../modules/crypt";

/**
 * GraphQL type for User and Typescript interface for User
 */
const TypeUser = `type User {
  uuid: ID!
  username: String!
  pwFunc: String!
  pwFuncOptions: PwFuncOptions!
  signKeyPayload: CryptoKey!
  encryptKeyPayload: CryptoKey!
  createdAt: Long!
}`;
export interface IUser {
  uuid: string;
  username: string;
  pwFunc: string;
  pwFuncOptions: IPwFuncOptions;
  signKeyPayload: ICryptoKey;
  encryptKeyPayload: ICryptoKey;
  createdAt: number;
}

const InputCryptPayload = `input CryptPayloadInput {
  type: String!
  version: String!
  auth: String!
  iv: String!
  cipherText: String!
}`;
const TypeCryptPayload = `type CryptPayload {
  type: String!
  version: String!
  auth: String!
  iv: String!
  cipherText: String!
}`;

const InputCryptoKey = `input CryptoKeyInput {
  publicKey: String!
  encKeyPayload: CryptPayloadInput!
}`;
const TypeCryptoKey = `type CryptoKey {
  publicKey: String!
  encKeyPayload: CryptPayload!
}`;
export interface ICryptoKey {
  publicKey: string;
  encKeyPayload: ICryptPayload;
}

/**
 * GraphQL input and Typescript interface for CreateUser
 */
const InputCreateUser = `input CreateUserInput {
  username: String!
  email: String
  pwh: String!
  pwFunc: String!
  pwFuncOptions: PwFuncOptionsInput!
  signKeyPayload: CryptoKeyInput!
  encryptKeyPayload: CryptoKeyInput!
}`;
export interface ICreateUserInput {
  username: string;
  email?: string;
  pwh: string;
  pwFunc: string;
  pwFuncOptions: IPwFuncOptions;
  signKeyPayload: ICryptoKey;
  encryptKeyPayload: ICryptoKey;
}

const InputSignInUser = `input SignInUserInput {
  username: String!
  pwh: String!
}`;
export interface ISignInUserInput {
  username: string;
  pwh: string;
}

/**
 * pwFunc options intended for pbkdf2 in Crypt.deriveMasterKeys
 * http://antelle.net/argon2-browser/
 */
const InputPwFuncOptions = `input PwFuncOptionsInput {
  nonce: String
  cost: Int
}`;
const TypePwFuncOptions = `type PwFuncOptions {
  nonce: String
  cost: Int
}`;
export interface IPwFuncOptions {
  nonce: string;
  cost: number;
}

/**
 * Autentication success response payload
 */
const TypeUserAuthPayload = `type UserAuthPayload {
  jwt: String!
  user: User!
}`;
export interface IUserAuthPayload {
  jwt: string;
  user: IUser;
}

/**
 * User authentication parameters
 */
const TypeUserAuthParams = `type UserAuthParams {
  pwFunc: String!
  pwFuncOptions: PwFuncOptions!
}`;
export interface IUserAuthParams {
  pwFunc: string;
  pwFuncOptions: IPwFuncOptions;
}

/**
 * Item creation parameters
 */
const InputCreateItem = `input CreateItemInput {
  # Base64 encode item content, if encrypted this is the cipher text
  payload: String!
  # Optional parent item UUID
  parentId: ID
  # Symmetric or Asymmetric encrypted item, blank if not encrypted
  encryptionType: String
  # Encryption version used
  version: String
  # Auth, Verification value
  auth: String
  # Single use encryption addenum
  iv: String
  # Signature of content before encryption
  sig: String!
}`;
export interface ICreateItemInput {
  payload: string;
  parentId?: string;
  encryptionType?: "SYMMETRIC" | "ASYMMETRIC";
  version?: string;
  auth?: string;
  iv?: string;
  sig: string;
}
const TypeItem = `type Item {
  uuid: ID!
  createdBy: User
  payload: String!
  parentId: ID
  encryptionType: String
  version: String
  auth: String
  iv: String
  sig: String!
  createdAt: Long!
}`;
export interface IItem {
  uuid: string;
  createdBy?: IUser;
  payload: string;
  parentId?: string;
  encryptionType?: string;
  version?: string;
  auth?: string;
  iv?: string;
  sig: string;
  createdAt: number;
}

/**
 * Queries, Mutations, Scalars
 */
const Query = `type Query {
  hello: String
  getUserAuthParams(username: String!): UserAuthParams!
}`;
const Mutation = `type Mutation {
  createUser(data: CreateUserInput!): UserAuthPayload!
  signInUser(data: SignInUserInput!): UserAuthPayload!
  createItem(data: CreateItemInput!): Item!
}`;
// Custom scalars should also be entered in the resolvers
const Scalars = `scalar Long`;

// Construct a schema, using GraphQL schema language
const gqlTypes: ReadonlyArray<string> = [
  TypeUser,
  TypeCryptPayload,
  InputCryptPayload,
  TypeCryptoKey,
  InputCryptoKey,
  InputCreateUser,
  InputSignInUser,
  InputPwFuncOptions,
  TypePwFuncOptions,
  TypeUserAuthPayload,
  TypeUserAuthParams,
  InputCreateItem,
  TypeItem,
  Query,
  Mutation,
  Scalars
];

export const typeDefs = gql(gqlTypes.join("\n"));
