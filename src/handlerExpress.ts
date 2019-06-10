import { APIGatewayProxyHandler } from "aws-lambda";
import serverless from "serverless-http";
import { app } from "./modules/configureExpress";

const handler = serverless(app, { binary: ["*/*"] });

export const express: APIGatewayProxyHandler = (event, context) => handler(event, context);
