import { APIGatewayProxyEvent, APIGatewayProxyResult, Callback, Context } from "aws-lambda";
import { graphql, hello } from "../handler";

describe("handler.ts", () => {
  // Stub event object
  const event: APIGatewayProxyEvent = {
    resource: "",
    path: "",
    httpMethod: "GET",
    headers: {
      Accept: "*/*",
    },
    multiValueHeaders: { Accept: ["*/*"], },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {
      resourceId: "",
      resourcePath: "",
      httpMethod: "",
      path: "",
      accountId: "",
      stage: "",
      requestTimeEpoch: new Date().getTime(),
      requestId: "",
      identity: {
        apiKey: "",
        apiKeyId: "",
        cognitoIdentityPoolId: null,
        accountId: null,
        cognitoIdentityId: null,
        caller: null,
        sourceIp: "0.0.0.0",
        accessKey: null,
        cognitoAuthenticationType: null,
        cognitoAuthenticationProvider: null,
        userArn: null,
        userAgent: "Test Agent",
        user: null
      },
      domainName: "",
      apiId: ""
    },
    body: null,
    isBase64Encoded: false
  };

  // Stub context object
  const context: Context = {
    callbackWaitsForEmptyEventLoop: true,
    logGroupName: "",
    logStreamName: "",
    functionName: "test",
    memoryLimitInMB: 1,
    functionVersion: "$LATEST",
    awsRequestId: "",
    invokedFunctionArn: "",
    getRemainingTimeInMillis: () => 0,
    done: () => null,
    fail: () => null,
    succeed: () => null
  };

  it("runs the /hello handler", done => {
    const cb: Callback<APIGatewayProxyResult> = (error, data) => {
      expect(error).toBeFalsy();
      expect(data).toHaveProperty("statusCode", 200);
      expect(data).toHaveProperty("body", JSON.stringify({
        message: "TypeScript function executed successfully!",
        event, context
      }));
      done();
    };
    hello(event, context, cb);
  });

  it("runs the /graphql handler", done => {
    const gqlEvent = {
      ...event,
      httpMethod: "POST",
      body: "{\"operationName\": null,\"variables\": {},\"query\": \"{hello}\"}"
    };
    const cb: Callback<APIGatewayProxyResult> = (error, data) => {
      expect(error).toBeFalsy();
      expect(data).toHaveProperty("statusCode", 200);
      expect(data).toHaveProperty("body", "{\"data\":{\"hello\":\"Hello world!\"}}\n");
      done();
    };
    graphql(gqlEvent, context, cb);
  });
});
