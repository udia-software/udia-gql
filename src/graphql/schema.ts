import { gql } from "apollo-server-lambda";

/**
 * GraphQL type for User and Typescript interface for User
 */
const TypeUser = `type User {
  uuid: ID!
  username: String!
  pwFunc: String!
  pwFuncOptions: PwFuncOptions!
  createdAt: Long!
}`;
export interface IUser {
  uuid: string;
  username: string;
  pwFunc: string;
  pwFuncOptions: IPwFuncOptions;
  createdAt: number;
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
}`;
export interface ICreateUserInput {
  username: string;
  email?: string;
  pwh: string;
  pwFunc: string;
  pwFuncOptions: IPwFuncOptions;
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
}`;
// Custom scalars should also be entered in the resolvers
const Scalars = `scalar Long`;

// Construct a schema, using GraphQL schema language
const gqlTypes: ReadonlyArray<string> = [
  TypeUser,
  InputCreateUser,
  InputPwFuncOptions,
  TypePwFuncOptions,
  TypeUserAuthPayload,
  TypeUserAuthParams,
  Query,
  Mutation,
  Scalars
];

export const typeDefs = gql(gqlTypes.join("\n"));
