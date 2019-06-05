import React from "react";
import { Helmet } from "react-helmet-async";
import { A, Center, H1 } from "../static/themedHelpers";

const Contact = () => (
  <Center>
    <Helmet>
      <title>Contact Page - UDIA</title>
      <meta name="description" content="Contact the Architect" />
    </Helmet>
    <H1>Contact</H1>
    <address
      style={{
        textDecoration: "none",
        fontStyle: "normal",
        textAlign: "center"
      }}
    >
      <A href="https://goo.gl/maps/sXheMfn7PRE2" target="_blank">
        Startup Edmonton
        <br />
        301 - 10359 104 Street NW
        <br />
        Edmonton, AB T5J 1B9
        <br />
        Canada
      </A>
    </address>
    <dl>
      <dt>
        <A href="mailto:alex@udia.ca">alex@udia.ca</A>
      </dt>
      <dd style={{ marginLeft: "1em" }}>
        <strong>role</strong>: developer > founder
        <br />
        <strong>gpg</strong>:{" "}
        <A href="https://media.udia.ca/keys/Alexander%20Wong.asc">armor</A>,{" "}
        <A href="https://media.udia.ca/keys/Alexander%20Wong.gpg">raw</A>
      </dd>
    </dl>
    <span>
      <A href="https://media.udia.ca/legal/Terms%20of%20Service.txt">
        Terms of Service
      </A>
      {" • "}
      <A href="https://media.udia.ca/legal/Privacy%20Policy.txt">
        Privacy Policy
      </A>
    </span>
  </Center>
);

export { Contact };
