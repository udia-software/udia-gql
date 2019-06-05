import React from "react";
import { Helmet } from "react-helmet-async";
import { Center, H1 } from "../static/themedHelpers";

const Home = () => (
  <Center>
    <Helmet>
      <title>Home - UDIA</title>
    </Helmet>
    <H1>UDIA</H1>
    <p>UDIA is the universal wildcard.</p>
    <p>It's listening to the universe dance with math and logic.</p>
    <p>It's I and You being one and inseperable.</p>
    <p>It is Understanding.</p>
    <H1>AI, DU</H1>
  </Center>
);

export { Home };
