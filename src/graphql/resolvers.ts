import UserManager from "../managers/userManager";
import { ICreateUserInput } from "./schema";

// Provide resolver functions for your schema fields
export const resolvers = {
  Query: {
    hello: () => "Hello world!",
    getUserAuthParams: async (_: any, params: { username: string }) => {
      return UserManager.getUserAuthParams(params.username);
    }
  },
  Mutation: {
    createUser: async (_: any, params: { data: ICreateUserInput }) => {
      return UserManager.createUser(params.data);
    }
  }
};
