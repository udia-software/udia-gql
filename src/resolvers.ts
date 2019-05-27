import { ICreateUser } from "./schema";
import UserManager from "./userManager";

// Provide resolver functions for your schema fields
export const resolvers = {
  Query: {
    hello: () => "Hello world!",
    getUserAuthParams: async (_: any, params: { username: string }) => {
      return UserManager.getUserAuthParams(params.username);
    }
  },
  Mutation: {
    createUser: async (_: any, params: { data: ICreateUser }) => {
      return UserManager.createUser(params.data);
    }
  }
};
