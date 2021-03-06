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
 * Queries, Mutations, Scalars
 */
const Query = `type Query {
  hello: String
  getUserAuthParams(username: String!): UserAuthParams!
}`;
const Mutation = `type Mutation {
  createUser(data: CreateUserInput!): UserAuthPayload!
  signInUser(data: SignInUserInput!): UserAuthPayload!
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
  Query,
  Mutation,
  Scalars
];

export const typeDefs = gql(gqlTypes.join("\n"));
