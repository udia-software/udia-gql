import { APIGatewayProxyEvent, APIGatewayProxyResult, Callback, Context } from "aws-lambda";
import { graphql, hello } from "../handler";

describe("handler.ts", () => {

  // Stub event object
  const event: APIGatewayProxyEvent = {
    headers: {
      "Host": "localhost:3000",
      "Connection": "keep-alive",
      "Cache-Control": "max-age=0",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "Test Stub Agent",
      "DNT": "1",
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-CA,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
    },
    multiValueHeaders: {
      "Host": ["localhost:3000"],
      "Connection": ["keep-alive"],
      "Cache-Control": ["max-age=0"],
      "Upgrade-Insecure-Requests": ["1"],
      "User-Agent": ["Test Stub Agent"],
      "Accept-Encoding": ["gzip, deflate, br"],
      "Accept-Language": ["en-CA,en-GB;q=0.9,en-US;q=0.8,en;q=0.7"],
    },
    path: "/hello",
    pathParameters: null,
    requestContext: {
      accountId: "offlineContext_accountId",
      resourceId: "offlineContext_resourceId",
      apiId: "offlineContext_apiId",
      stage: "dev",
      requestId: "offlineContext_requestId_5585786883095889",
      identity: {
        cognitoIdentityPoolId: "offlineContext_cognitoIdentityPoolId",
        accountId: "offlineContext_accountId",
        cognitoIdentityId: "offlineContext_cognitoIdentityId",
        caller: "offlineContext_caller",
        apiKey: "offlineContext_apiKey",
        sourceIp: "127.0.0.1",
        cognitoAuthenticationType: "offlineContext_cognitoAuthenticationType",
        cognitoAuthenticationProvider: "offlineContext_cognitoAuthenticationProvider",
        userArn: "offlineContext_userArn",
        userAgent: "Test Stub Agent",
        user: "offlineContext_user",
        accessKey: "",
        apiKeyId: ""
      },
      authorizer: { principalId: "offlineContext_authorizer_principalId" },
      resourcePath: "/hello",
      httpMethod: "GET",
      requestTimeEpoch: 0,
      path: ""
    },
    resource: "/hello",
    httpMethod: "GET",
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    body: null,
    isBase64Encoded: false
  };

  // Stub context object
  const context: Context = {
    functionName: "udia-gql-dev-hello",
    memoryLimitInMB: 128,
    functionVersion: "offline_functionVersion_for_udia-gql-dev-hello",
    invokedFunctionArn: "offline_invokedFunctionArn_for_udia-gql-dev-hello",
    awsRequestId: "offline_awsRequestId_9473886893271608",
    logGroupName: "offline_logGroupName_for_udia-gql-dev-hello",
    logStreamName: "offline_logStreamName_for_udia-gql-dev-hello",
    done: () => undefined,
    fail: () => undefined,
    succeed: () => undefined,
    getRemainingTimeInMillis: () => -1,
    callbackWaitsForEmptyEventLoop: true
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
