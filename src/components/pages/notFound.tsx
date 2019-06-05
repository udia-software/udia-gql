import { Location } from "history";
import React from "react";
import { Helmet } from "react-helmet-async";
import styled from "../static/appStyles";
import { Center, H1, Link } from "../static/themedHelpers";

const StyledNotFoundText = styled.span`
  color: ${({ theme }) => theme.purple};
`;

const NotFound = ({ location }: { location: Location }) => (
  <Center>
    <Helmet>
      <title>Not Found - UDIA</title>
    </Helmet>
    <H1>Not Found</H1>
    <p>
      No match exists for{" "}
      <StyledNotFoundText>{location.pathname}</StyledNotFoundText>.
    </p>
    <Link to="/">Return to the home page →</Link>
  </Center>
);

export { NotFound };
