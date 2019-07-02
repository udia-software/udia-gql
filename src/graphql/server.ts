import { ApolloServer } from "apollo-server-lambda";
import UniversalCookie from "universal-cookie";
import Auth from "../modules/auth";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";

export interface IGraphQLContext {
  userId?: string;
}

export const server = new ApolloServer({
  typeDefs, resolvers, context: ({ event }) => {
    const ctx: IGraphQLContext = {};
    try {
      const cookies = new UniversalCookie(event.headers.Cookie);
      const jwt: string | undefined = cookies.get("jwt");
      if (jwt) {
        const { uuid } = Auth.verifyUserJWT(jwt);
        ctx.userId = uuid;
      }
    } catch (err) {
      // tslint:disable-next-line: no-console
      console.error(err);
    }
    return ctx;
  },
});
