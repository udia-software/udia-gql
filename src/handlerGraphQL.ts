import { APIGatewayProxyHandler } from "aws-lambda";
import { server } from "./graphql/server";

export const graphql: APIGatewayProxyHandler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true,
  },
});
