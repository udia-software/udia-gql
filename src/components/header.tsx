import React from "react";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import { IRootState } from "../modules/configureReduxStore";
import styled from "./static/appStyles";

const HeaderContainer = styled.div`
  max-width: 100%;
  width: 100%;
  grid-area: header;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-auto-flow: column;
`;
const HeaderRightContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-flow: column dense;
`;

const CLASS_NAVACTIVE = "header-nav-active";
const ENavLink = styled(NavLink).attrs<{ activeClassName: string }>({
  activeClassName: CLASS_NAVACTIVE
})`
  transition: all 0.2s ease-in;
  text-decoration: none;
  color: ${({ theme }) => theme.intermediateColor};
  justify-self: end;
  align-self: center;
  font-size: large;
  padding: 0.4em;
  border-right: 1px solid ${({ theme }) => theme.backgroundColor};
  border-left: 1px solid ${({ theme }) => theme.backgroundColor};
  &&:hover {
    color: ${({ theme }) => theme.primaryColor};
    border-right: 1px solid ${({ theme }) => theme.primaryColor};
    border-left: 1px solid ${({ theme }) => theme.primaryColor};
  }
  &.${CLASS_NAVACTIVE} {
    color: ${({ theme }) => theme.primaryColor};
    border-left: 1px solid ${({ theme }) => theme.intermediateColor};
    border-right: 1px solid ${({ theme }) => theme.intermediateColor};
  }
`;
const TNavLink = styled(ENavLink)`
  justify-self: start;
  font-weight: bold;
  font-size: 2em;
  padding: 0.2em 0.4em;
  &.${CLASS_NAVACTIVE} {
    color: ${({ theme }) => theme.primaryColor};
    border-left: 1px solid ${({ theme }) => theme.backgroundColor};
    border-right: 1px solid ${({ theme }) => theme.backgroundColor};
  }
`;

interface IProps {
  NODE_ENV: string;
  userId?: string;
  username?: string;
}

const HeaderComp = (props: IProps) => (
  <HeaderContainer>
    <TNavLink to="/">
      UDIA
      {props.NODE_ENV === "development" && (
        <span style={{ fontSize: "xx-small" }}>-DEV</span>
      )}
    </TNavLink>
    {!props.userId && (
      <HeaderRightContainer>
        <ENavLink to="/create">Create</ENavLink>
        <ENavLink to="/sign-up">Sign Up</ENavLink>
        <ENavLink to="/log-in">Log In</ENavLink>
      </HeaderRightContainer>
    )}
    {props.userId && (
      <HeaderRightContainer>
        <ENavLink to="/create">Create</ENavLink>
        <ENavLink to="/sign-out">
          {!!props.username ? props.username : "Sign Out"}
        </ENavLink>
      </HeaderRightContainer>
    )}
  </HeaderContainer>
);

const mapStateToProps = (state: IRootState) => ({
  NODE_ENV: state.environment.NODE_ENV,
  userId: state.userUniversal.userId,
  username: state.userUniversal.username
});

const Header = connect(mapStateToProps)(HeaderComp);
export { Header };
