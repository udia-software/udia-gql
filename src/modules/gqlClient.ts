import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import fetch from "unfetch";

const link = createHttpLink({
  fetch,
  uri: "/graphql",
  credentials: "same-origin"
});

export const gqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link
});
