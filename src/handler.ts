import { express as expressHandler } from "./handlerExpress";
import { graphql as graphqlHandler } from "./handlerGraphQL";
import { hello as helloHandler } from "./handlerHello";

export const graphql = graphqlHandler;
export const hello = helloHandler;
export const express = expressHandler;
