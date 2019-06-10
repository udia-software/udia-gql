import { APIGatewayProxyHandler } from "aws-lambda";
import { server } from "./graphql/server";

export const graphql: APIGatewayProxyHandler = (event, context, cb) => {
  // tslint:disable-next-line: no-console
  // console.log(event, context, cb);
  if (event.body !== null && event.isBase64Encoded) {
    // https://github.com/apollographql/apollo-server/issues/2599
    event.body = Buffer.from(event.body, "base64").toString();
    event.isBase64Encoded = false;
  }
  return server.createHandler({
    cors: {
      origin: "*",
      credentials: true,
    },
  })(event, context, cb);
};
