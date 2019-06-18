import UserManager from "../managers/userManager";
import { GraphQLTypeLong } from "./scalars";
import { ICreateUserInput, ISignInUserInput } from "./schema";

// Provide resolver functions for your schema fields
export const resolvers = {
  Query: {
    hello: () => "Hello world!",
    getUserAuthParams: async (_: any, params: { username: string }) => {
      return UserManager.getUserAuthParams(params.username);
    }
  },
  Mutation: {
    createUser: async (_: any, params: { data: ICreateUserInput }) =>
      UserManager.createUser(params.data),
    signInUser: async (_: any, params: { data: ISignInUserInput }) =>
      UserManager.signInUser(params.data),
  },
  // Put custom scalars here
  Long: GraphQLTypeLong
};
