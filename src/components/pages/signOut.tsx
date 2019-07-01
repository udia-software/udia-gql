import React, { Component, FormEventHandler } from "react";
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
import { LocalForageContext } from "../../modules/localForageContext";
import { LoadingOverlay } from "../composite/loadingOverlay";
import {
  Form,
  FormFieldset,
  FormLegend,
  FormOutput,
  SubmitButton
} from "../static/formHelpers";
import { Center, H1 } from "../static/themedHelpers";

interface IState {
  isLoading: boolean;
  loadingText: string;
  errorMessage: string;
}

interface IProps {
  NODE_ENV: string;
  userid?: string;
  username?: string;
  logout: () => ISetUserIDAction;
  clearName: () => ISetUserNameAction;
}

class SignOutController extends Component<IProps, IState> {
  public static contextType = LocalForageContext;
  public context!: React.ContextType<typeof LocalForageContext>;

  private isRedirecting: boolean;

  constructor(props: IProps) {
    super(props);
    this.state = {
      isLoading: false,
      loadingText: "",
      errorMessage: ""
    };
    this.isRedirecting = false;
  }

  public render() {
    const { userid, username } = this.props;
    const { isLoading, loadingText, errorMessage } = this.state;

    if (!userid) {
      if (!this.isRedirecting) {
        this.isRedirecting = true;
        return <Redirect to="/" />;
      }
    }

    return (
      <Center gridTemplateAreas={`"title" "form" "links"`}>
        <LoadingOverlay
          gridArea={"form"}
          isLoading={isLoading}
          loadingText={loadingText}
        />
        <Helmet>
          <title>Sign Out - UDIA</title>
          <meta name="description" content="Sign out of UDIA, User." />
        </Helmet>
        <H1 gridArea={"title"}>Sign Out</H1>
        <Form
          gridArea={"form"}
          autoComplete="off"
          method="post"
          onSubmit={this.handleSubmit}
        >
          <FormFieldset>
            <FormLegend>Leaving, {username ? username : "User"}?</FormLegend>
            {!!errorMessage && <FormOutput>{errorMessage}</FormOutput>}
            <SubmitButton type="submit" children={"Sign Out"} />
          </FormFieldset>
        </Form>
      </Center>
    );
  }

  protected handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    const { logout, clearName } = this.props;
    this.setState(() => ({
      isLoading: true,
      loadingText: "Clearing authentication token...",
      errorMessage: ""
    }));
    let logoutOk: boolean = false;
    try {
      const response = await fetch("/resource/jwt", {
        method: "POST",
        mode: "same-origin",
        cache: "no-cache",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        redirect: "follow",
        body: JSON.stringify({})
      });
      const { authenticated } = await response.json();
      logoutOk = !authenticated;
      if (!logoutOk) {
        throw new Error("Failed to remove persistence token");
      }
      this.setState(() => ({
        loadingText: "Logging out...",
      }));
      await this.context.clear();
      clearName();
    } catch (err) {
      this.setState(() => ({
        errorMessage: err.toString()
      }));
    } finally {
      this.setState(() => ({ isLoading: false }));
      if (logoutOk) {
        logout();
      }
    }
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
)(SignOutController);
