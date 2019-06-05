import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link as rrLink } from "react-router-dom";
import styled, { css } from "./appStyles";

// Themed Links
const LinkCSS = css`
  cursor: pointer;
  transition: color 0.1s ease-in;
  text-decoration: none;
  color: ${({ theme }) => theme.intermediateColor};
  &:hover { color: ${({ theme }) => theme.primaryColor}; };
`;
export const Link = styled(rrLink)`${LinkCSS}`;
export const A = styled.a`${LinkCSS}`;

// Themed Headers
const HeaderCSS = css`
  padding: 0;
  margin: 0 0 0.3em 0;
`;
export const H1 = styled.h1`${HeaderCSS}`;
export const H2 = styled.h2`${HeaderCSS}`;
export const H3 = styled.h3`${HeaderCSS}`;
export const H4 = styled.h4`${HeaderCSS}`;
export const H5 = styled.h5`${HeaderCSS}`;
export const H6 = styled.h6`${HeaderCSS}`;

// Centered Content
export const Center = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-content: center;
  place-items: center;
  text-align: center;
`;

// Colored Icons
export const GreenIcon = styled(FontAwesomeIcon)`
  color: ${({ theme }) => theme.green};
`;
export const RedIcon = styled(FontAwesomeIcon)`
  color: ${({ theme }) => theme.red};
`;
