import { gql } from "apollo-server-lambda";

/**
 * GraphQL type for User and Typescript interface for User
 */
const TypeUser = `type User {
  uuid: ID!
  username: String!
  pwFunc: String!
  pwFuncOptions: PwFuncOptions!
  createdAt: Int!
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
  pwh: String!
  pwFunc: String!
  pwFuncOptions: PwFuncOptionsInput!
}`;
export interface ICreateUserInput {
  username: string;
  pwh: string;
  pwFunc: string;
  pwFuncOptions: IPwFuncOptions;
}

/**
 * pwFunc options intended for Argon2di, but generalizeable (PBKDF2)
 * http://antelle.net/argon2-browser/
 */
const InputPwFuncOptions = `input PwFuncOptionsInput {
  salt: String
  memory: Int
  iterations: Int
  hashLength: Int
  parallelism: Int
  type: Int
}`;
const TypePwFuncOptions = `type PwFuncOptions {
  salt: String
  memory: Int
  iterations: Int
  hashLength: Int
  parallelism: Int
  type: Int
}`;
export interface IPwFuncOptions {
  salt: string;
  memory: number;
  iterations: number;
  hashLength: number;
  parallelism: number;
  type: number;
}

const TypeUserAuthPayload = `type UserAuthPayload {
  jwt: String!
  user: User!
}`;
export interface IUserAuthPayload {
  jwt: string;
  user: IUser;
}

const TypeUserAuthParams = `type UserAuthParams {
  pwFunc: String!
  pwFuncOptions: PwFuncOptions!
}`;
export interface IUserAuthParams {
  pwFunc: string;
  pwFuncOptions: IPwFuncOptions;
}

const Query = `type Query {
  hello: String
  getUserAuthParams(username: String!): UserAuthParams!
}`;

const Mutation = `type Mutation {
  createUser(data: CreateUserInput!): UserAuthPayload!
}`;

// Construct a schema, using GraphQL schema language
const gqlTypes: ReadonlyArray<string> = [
  TypeUser,
  InputCreateUser,
  InputPwFuncOptions,
  TypePwFuncOptions,
  TypeUserAuthPayload,
  TypeUserAuthParams,
  Query,
  Mutation
];

export const typeDefs = gql(gqlTypes.join("\n"));
