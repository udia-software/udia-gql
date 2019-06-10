import katex from "katex";
import React from "react";
import { Helmet } from "react-helmet-async";
import { Center, H2, H4 } from "../static/themedHelpers";

const About = () => (
  <Center>
    <Helmet>
      <title>About - UDIA</title>
    </Helmet>
    <H2>This iteration of UDIA is:</H2>
    <div style={{ paddingTop: "0.4em", paddingBottom: "0.4em" }}>
      <span
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(
            "P(s', r|s, a) \\doteq P(S_t=s', R_t=r|S_{t-1}=s, A_{t-1}=a)"
          )
        }}
      />
      <p>An application of states, actions, and rewards; namely:</p>
      <hr style={{ width: "100%" }} />
    </div>
    <div>
      <span
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(
            "q_\\pi(s, a) \\doteq \\mathbb{E}_\\pi\\Big[\\sum_{k=0}^\\infin\\gamma^kR_{t+k+1}|S_t=s, A_t=a\\Big]"
          )
        }}
      />
      <p>The value of an action in a state, given a policy</p>
    </div>
    <div>
      <span
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(
            "V_\\pi(s) \\doteq \\mathbb{E}_\\pi\\Big[\\sum_{k=0}^\\infin\\gamma^kR_{t+k+1}|S_t=s\\Big]"
          )
        }}
      />
      <p>The value of state, given a policy</p>
    </div>
    <div>
      <span
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(
            "G_t \\doteq \\sum_{k=0}^\\infin(\\gamma^kR_{t+k+1})"
          )
        }}
      />
      <p>A singular goal</p>
    </div>
    <H4>We are all agents of the universal dream.</H4>
  </Center>
);

export { About };
