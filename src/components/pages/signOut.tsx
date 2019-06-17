import React, { Component, FormEventHandler } from "react";
import { Cookies, withCookies } from "react-cookie";
import { Helmet } from "react-helmet-async";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import { Dispatch } from "redux";
import {
  IRootState,
  ISetUserIDAction,
  ISetUserNameAction,
  setUserId,
  setUserName
} from "../../modules/configureReduxStore";
import {
  Form,
  FormFieldset,
  FormLegend,
  SubmitButton
} from "../static/formHelpers";
import { Center, H1 } from "../static/themedHelpers";

interface IProps {
  cookies: Cookies;
  NODE_ENV: string;
  userid?: string;
  username?: string;
  logout: () => ISetUserIDAction;
  clearName: () => ISetUserNameAction;
}

class SignOutController extends Component<IProps> {
  private isRedirecting: boolean;
  constructor(props: IProps) {
    super(props);
    this.isRedirecting = false;
  }

  public render() {
    const { userid, username } = this.props;
    if (!userid) {
      if (!this.isRedirecting) {
        this.isRedirecting = true;
        return <Redirect to="/" />;
      }
    }

    return (
      <Center>
        <Helmet>
          <title>Sign Out - UDIA</title>
          <meta name="description" content="Sign out of UDIA, User." />
        </Helmet>
        <H1>Sign Out</H1>
        <Form autoComplete="off" method="post" onSubmit={this.handleSubmit}>
          <FormFieldset>
            <FormLegend>Leaving, {username ? username : "User"}?</FormLegend>
            <SubmitButton type="submit" children={"Sign Out"} />
          </FormFieldset>
        </Form>
      </Center>
    );
  }

  protected handleSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    const { cookies, NODE_ENV, logout, clearName } = this.props;
    cookies.remove("jwt", {
      path: "/", secure: NODE_ENV === "production", sameSite: true
    });
    clearName();
    logout();
  };
}

const mapStateToProps = (state: IRootState) => ({
  NODE_ENV: state.environment.NODE_ENV,
  userid: state.userUniversal.userId,
  username: state.userUniversal.username
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  logout: () => dispatch(setUserId(null)),
  clearName: () => dispatch(setUserName(null))
});

export const SignOut = connect(
  mapStateToProps,
  mapDispatchToProps
)(withCookies(SignOutController));
