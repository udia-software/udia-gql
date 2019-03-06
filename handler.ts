import { ApolloServer } from "apollo-server-lambda";
import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { resolvers } from "./src/resolvers";
import { typeDefs } from "./src/schema";


export const hello: APIGatewayProxyHandler = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message:
        "Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!",
      input: event
    })
  };
};

const server = new ApolloServer({ typeDefs, resolvers });
export const graphql: APIGatewayProxyHandler = server.createHandler();
