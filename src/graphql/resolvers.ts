import { createItem } from "../server/item";
import { createUser, getUserAuthParams, signInUser } from "../server/user";
import { GraphQLTypeLong } from "./scalars";
import { ICreateItemInput, ICreateUserInput, ISignInUserInput } from "./schema";
import { IGraphQLContext } from "./server";

// Provide resolver functions for your schema fields
export const resolvers = {
  Query: {
    hello: () => "Hello world!",
    getUserAuthParams: (_: any, params: { username: string }) =>
      getUserAuthParams(params.username)
  },
  Mutation: {
    createUser: (_: any, params: { data: ICreateUserInput }) =>
      createUser(params.data),
    signInUser: (_: any, args: { data: ISignInUserInput }) =>
      signInUser(args.data),
    createItem: (_: any, args: { data: ICreateItemInput }, context: IGraphQLContext) =>
      createItem(args.data, context.userId)
  },
  Long: GraphQLTypeLong
};
