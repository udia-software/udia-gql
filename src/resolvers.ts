import { ICreateUser } from "./schema";
import UserManager from "./userManager";

// Provide resolver functions for your schema fields
export const resolvers = {
  Query: {
    hello: () => "Hello world!"
  },
  Mutation: {
    createUser: async (_root: any, params: { data: ICreateUser }, _context: any) => {
      // TODO: persistance, validation
      // console.log(root)
      // console.log(params)
      // console.log(context)
      return UserManager.createUser(params.data)
    }
  }
};
