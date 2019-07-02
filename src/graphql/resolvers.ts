import ItemManager from "../managers/itemManager";
import UserManager from "../managers/userManager";
import { GraphQLTypeLong } from "./scalars";
import { ICreateItemInput, ICreateUserInput, ISignInUserInput } from "./schema";
import { IGraphQLContext } from "./server";

// Provide resolver functions for your schema fields
export const resolvers = {
  Query: {
    hello: () => "Hello world!",
    getUserAuthParams: (_: any, params: { username: string }) =>
      UserManager.getUserAuthParams(params.username)
  },
  Mutation: {
    createUser: (_: any, params: { data: ICreateUserInput }) =>
      UserManager.createUser(params.data),
    signInUser: (_: any, args: { data: ISignInUserInput }) =>
      UserManager.signInUser(args.data),
    createItem: (_: any, args: { data: ICreateItemInput }, context: IGraphQLContext) =>
      ItemManager.createItem(args.data, context.userId)
  },
  // Put custom scalars here
  Long: GraphQLTypeLong
};
