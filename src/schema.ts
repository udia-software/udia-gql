import { gql } from "apollo-server-lambda";

const TypeUser = `
type User {
  uuid: ID!
  username: String!
  pwFunc: String!
  pwFuncOptions: TPwFuncOptions!
  createdAt: Int!
}`;
export interface IUser {
  uuid: string;
  username: string;
  pwFunc: string;
  pwFuncOptions: IPwFuncOptions;
  createdAt: number;
}

const InputCreateUser = `
input ICreateUser {
  username: String!
  pwh: String!
  pwFunc: String!
  pwFuncOptions: IPwFuncOptions!
}`;

export interface ICreateUser {
  username: string;
  pwh: string;
  pwFunc: string;
  pwFuncOptions: IPwFuncOptions;
}

/**
 * pwFunc options intended for Argon2di, but generalizeable (PBKDF2)
 * http://antelle.net/argon2-browser/
 */
const InputPwFuncOptions = `
input IPwFuncOptions {
  salt: String
  memory: Int
  iterations: Int
  hashLength: Int
  parallelism: Int
  type: Int
}`;

const TypePwFuncOptions = `
type TPwFuncOptions {
  salt: String
  memory: Int
  iterations: Int
  hashLength: Int
  parallelism: Int
  type: Int
}`;

const TypeUserAuthPayload = `
type UserAuthPayload {
  jwt: String!
  user: User!
}`;
export interface IUserAuthPayload {
  jwt: string;
  user: IUser;
}

export interface IPwFuncOptions {
  salt: string;
  memory: number;
  iterations: number;
  hashLength: number;
  parallelism: number;
  type: number;
}

// Construct a schema, using GraphQL schema language
export const typeDefs = gql(`
  ${TypeUser}
  ${InputCreateUser}
  ${InputPwFuncOptions}
  ${TypePwFuncOptions}
  ${TypeUserAuthPayload}

  type UserAuthParams {
    pwFunc: String!
    pwFuncOptions: TPwFuncOptions!
  }

  type Query {
    hello: String

    # Get the user authentication parameters for a given username
    getUserAuthParams(
      # User provided username
      username: String!
    ): UserAuthParams!
  }

  type Mutation {
    createUser(data: ICreateUser!): UserAuthPayload!
  }
`);
