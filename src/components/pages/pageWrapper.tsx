/**
 * Component that fills the whole screen.
 * - includes a header and footer with children in the middle
 */
import React from "react";
import { Footer } from "../footer";
import { Header } from "../header";
import styled from "../static/appStyles";

// grid caused errors with content x-axis overflow
// const ElemPageWrapper = styled.div`
//   display: grid;
//   grid-template-areas:
//     "header"
//     "content"
//     "footer";
//   grid-template-columns: auto;
//   grid-template-rows: auto 1fr auto;
//   width: 100%;
//   min-height: 100vh;
// `;

const ElemPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: flex-start;
  align-content: stretch;
  min-height: 100vh;
`;

const Content = styled.div`
  min-height: 88vh;
  width: 100%;
  max-width: 100%;
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
