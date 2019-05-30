import { APIGatewayProxyHandler } from "aws-lambda";

export const hello: APIGatewayProxyHandler = (event, context, callback) => {
  callback(undefined, {
    statusCode: 200,
    body: JSON.stringify({
      message: "TypeScript function executed successfully!",
      event, context
    })
  });
};
