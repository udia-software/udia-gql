import { graphql as graphqlHandler } from "./handlerGraphQL";
import { hello as helloHandler } from "./handlerHello";

export const graphql = graphqlHandler;
export const hello = helloHandler;
