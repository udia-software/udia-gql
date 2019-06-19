import React from "react";
import { NavLink } from "react-router-dom";
import styled from "./static/appStyles";
import { Logo } from "./static/logo";
import { A, H3 } from "./static/themedHelpers";

const FooterContainer = styled.div`
  max-width: 100%;
  width: 100%;
  grid-area: footer;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  grid-auto-flow: row dense;
  align-self: flex-end;
  @media screen and (max-width: 533px) {
    grid-template-columns: 1fr;
  }
`;
const ContactBlock = styled.div`
  align-self: start;
  justify-self: start;
`;
const LogoBlock = styled.div`
  align-self: center;
  justify-self: center;
`;
const LinksBlock = styled.div`
  text-align: right;
  align-self: start;
  justify-self: end;
`;
const LinksNoStyle = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  > li {
    margin: 0.2em 0 0.2em 0;
  }
`;
const CLASS_NAVACTIVE = "footer-nav-active";
const FNavLink = styled(NavLink).attrs<{ activeClassName: string }>({
  activeClassName: CLASS_NAVACTIVE
})`
transition: all 0.2s ease-in;
text-decoration: none;
color: ${({ theme }) => theme.intermediateColor};
padding: 0.1em 0 0.1em 0.4em;
justify-self: end;
align-self: center;
border-left: 1px solid ${({ theme }) => theme.backgroundColor};
&&:hover {
  color: ${({ theme }) => theme.primaryColor};
  border-left: 1px solid ${({ theme }) => theme.primaryColor};
}
&.${CLASS_NAVACTIVE} {
  color: ${({ theme }) => theme.primaryColor};
  border-left: 1px solid ${({ theme }) => theme.intermediateColor};
}
`;
const Footer = ({ toggleTheme }: { toggleTheme: () => void }) => (
  <FooterContainer>
    <ContactBlock>
      <H3>Udia Software Incorporated</H3>
      <A href="https://goo.gl/maps/sXheMfn7PRE2" rel="noopener noreferrer" target="_blank">
        Startup Edmonton
        <br />
        301 - 10359 104 Street NW
        <br />
        Edmonton, AB T5J 1B9
        <br />
        Canada
      </A>
    </ContactBlock>
    <LogoBlock onClick={toggleTheme} style={{ cursor: "pointer" }}>
      <Logo width={114} />
    </LogoBlock>
    <LinksBlock>
      <H3>Links</H3>
      <LinksNoStyle>
        <li>
          <FNavLink exact to="/">Home</FNavLink>
        </li>
        <li>
          <FNavLink to="/about">About</FNavLink>
        </li>
        <li>
          <FNavLink to="/contact">Contact</FNavLink>
        </li>
      </LinksNoStyle>
    </LinksBlock>
  </FooterContainer>
);

export { Footer };
