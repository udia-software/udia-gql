/**
 * Component that fills the whole screen.
 * - includes a header and footer with children in the middle
 */
import React from "react";
import { Footer } from "../footer";
import { Header } from "../header";
import styled from "../static/appStyles";

const ElemPageWrapper = styled.div`
  display: grid;
  grid: auto 1fr auto / 1fr;
  grid-template-areas:
    "header"
    "content"
    "footer";
  width: 100%;
  min-height: 100vh;
`;
const Content = styled.div`
  grid-area: content;
`;
const PageWrapper = (props: {
  children: React.ReactNode | React.ReactNodeArray;
  toggleTheme: () => VoidFunction;
}) => (
  <ElemPageWrapper>
    <Header {...props} />
    <Content children={props.children} />
    <Footer toggleTheme={props.toggleTheme} />
  </ElemPageWrapper>
);

export { PageWrapper };
