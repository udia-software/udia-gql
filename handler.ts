import { APIGatewayProxyHandler } from "aws-lambda";
import { server } from "./src/graphql/server";

export const hello: APIGatewayProxyHandler = (event, context, callback) => {
  callback(undefined, {
    statusCode: 200,
    body: JSON.stringify({
      message: "TypeScript function executed successfully!",
      event, context
    })
  });
};

export const graphql: APIGatewayProxyHandler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true,
  },
});
