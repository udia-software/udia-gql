import { ApolloServer } from "apollo-server-lambda";
import { APIGatewayProxyHandler } from "aws-lambda";
// import "source-map-support/register";
import { resolvers } from "./src/resolvers";
import { typeDefs } from "./src/schema";


export const hello: APIGatewayProxyHandler = (event, context, callback) => {
  callback(undefined, {
    statusCode: 200,
    body: JSON.stringify({
      message:
        "TypeScript function executed successfully!",
      event, context
    })
  });
};

const server = new ApolloServer({
  typeDefs, resolvers, context: ({ event, context }) => ({
    headers: event.headers,
    functionName: context.functionName,
    event,
    context,
  }),
});
export const graphql: APIGatewayProxyHandler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
});
