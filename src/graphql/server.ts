import { ApolloServer } from "apollo-server-lambda";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";

export const server = new ApolloServer({
  typeDefs, resolvers, context: ({ event, context }) => {
    const ctx = {
      headers: event.headers,
      functionName: context.functionName,
      event,
      context,
    };
    // tslint:disable-next-line: no-console
    console.log(event, context);
    return ctx;
  },
});
