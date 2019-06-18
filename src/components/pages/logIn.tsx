import ApolloClient from "apollo-client";
import gql from "graphql-tag";
import React, {
  ChangeEventHandler,
  Component,
  createRef,
  FocusEventHandler,
  FormEventHandler,
  MouseEventHandler,
  RefObject
} from "react";
import { withApollo } from "react-apollo";
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
import Crypt from "../../modules/crypt";
import { LoginPasswordFormField } from "../composite/passwordFormField";
import { LoginUsernameFormField } from "../composite/usernameFormField";
import { Checkbox } from "../static/checkbox";
import {
  Form,
  FormField,
  FormFieldset,
  FormLabel,
  FormLabelContent,
  FormLegend,
  FormOutput,
  SubmitButton
} from "../static/formHelpers";
import { Center, H1, Link } from "../static/themedHelpers";

interface IState {
  username: string;
  password: string;
  focusedElement: string;
  isLoading: boolean;
  unameExists?: boolean;
  pwExists?: boolean;
  showPassword: boolean;
  rememberUser: boolean;
  hasError: boolean;
  errorMessage: string;
}

interface IProp {
  client: ApolloClient<{}>;
  cookies: Cookies;
  NODE_ENV: string;
  userId?: string;
  login: (userId: string) => ISetUserIDAction;
  setName: (username: string) => ISetUserNameAction;
}

class LogInController extends Component<IProp, IState> {
  private TIP_TIMEOUT_MS = 200;
  private usernameInputRef: RefObject<HTMLInputElement>;
  private passwordInputRef: RefObject<HTMLInputElement>;
  private isRedirecting: boolean;

  constructor(props: IProp) {
    super(props);
    this.state = {
      username: "",
      password: "",
      focusedElement: "",
      isLoading: false,
      showPassword: false,
      rememberUser: false,
      hasError: false,
      errorMessage: ""
    };
    this.usernameInputRef = createRef();
    this.passwordInputRef = createRef();
    this.isRedirecting = false;
  }

  public render() {
    const {
      username,
      password,
      focusedElement,
      isLoading,
      unameExists,
      pwExists,
      showPassword,
      rememberUser,
      hasError,
      errorMessage
    } = this.state;

    // if the user is logged in, redirect to the home page.
    if (this.props.userId && !isLoading) {
      if (!this.isRedirecting) {
        this.isRedirecting = true;
        return <Redirect to="/" />;
      }
    }

    let submitButtonText = "Submit";
    const showFormErrors =
      (typeof unameExists !== "undefined" && !unameExists) ||
      (typeof pwExists !== "undefined" && !pwExists) ||
      hasError;
    if (isLoading) {
      submitButtonText = "Submitting...";
    } else if (showFormErrors) {
      submitButtonText = "Check Errors";
    }
    return (
      <Center>
        <Helmet>
          <title>Log In - UDIA</title>
          <meta name="description" content="Log into your account, User." />
        </Helmet>
        <H1>Log In</H1>
        <Form autoComplete="off" method="POST" onSubmit={this.handleSubmit}>
          <FormFieldset>
            <FormLegend>Welcome back, User.</FormLegend>
            <LoginUsernameFormField
              unameExists={unameExists}
              handleInputChange={this.handleInputChange}
              handleInputFocus={this.handleInputFocus}
              handleInputBlur={this.handleInputBlur}
              username={username}
              isLoading={isLoading}
              usernameInputRef={this.usernameInputRef}
              isFocusUsername={focusedElement === "username"}
              tipTimeout={this.TIP_TIMEOUT_MS}
            />
            <LoginPasswordFormField
              pwExists={pwExists}
              showPassword={showPassword}
              toggleShowPassword={this.toggleShowPassword}
              handleInputChange={this.handleInputChange}
              handleInputFocus={this.handleInputFocus}
              handleInputBlur={this.handleInputBlur}
              password={password}
              isLoading={isLoading}
              passwordInputRef={this.passwordInputRef}
              isFocusPassword={focusedElement === "password"}
              tipTimeout={this.TIP_TIMEOUT_MS}
            />
            <FormField>
              <FormLabel style={{ cursor: "pointer" }}>
                <FormLabelContent>
                  Remember Me
                  <Checkbox
                    name="remember"
                    handleChange={this.handleInputChange}
                    checked={rememberUser}
                  />
                </FormLabelContent>
              </FormLabel>
            </FormField>
            {hasError && <FormOutput>{errorMessage}</FormOutput>}
            <SubmitButton
              type="submit"
              disabled={isLoading || showFormErrors}
              children={submitButtonText}
            />
          </FormFieldset>
        </Form>
        <Link to="/sign-up">← I do not have an account</Link>
      </Center>
    );
  }

  protected handleInputChange: ChangeEventHandler<HTMLInputElement> = e => {
    const stateDiff = { [e.currentTarget.name]: e.currentTarget.value };
    const checkDiff = { [e.currentTarget.name]: e.currentTarget.checked };
    if ("password" in stateDiff) {
      this.setState(() => ({
        password: stateDiff.password.normalize("NFKC"),
        pwExists: !!stateDiff.password
      }));
    }
    if ("username" in stateDiff) {
      this.setState(() => ({
        username: stateDiff.username.normalize("NFKC"),
        unameExists: !!stateDiff.username
      }));
    }
    if ("remember" in checkDiff) {
      this.setState(() => ({ rememberUser: checkDiff.remember }));
    }
    this.setState(() => ({ hasError: false }));
  };

  protected handleInputFocus: FocusEventHandler<HTMLInputElement> = e => {
    const focusedElement = e.currentTarget.name;
    this.setState(() => ({ focusedElement }));
  };

  protected handleInputBlur: FocusEventHandler<HTMLInputElement> = e => {
    const focusedElement = e.currentTarget.name;
    if (focusedElement === "username") {
      this.setState(({ username }) => ({
        focusedElement: "username",
        unameExists: !!username
      }));
    } else if (focusedElement === "password") {
      this.setState(({ password }) => ({
        focusedElement: "password",
        pwExists: !!password
      }));
    }
  };

  protected toggleShowPassword: MouseEventHandler<HTMLAnchorElement> = e => {
    e.preventDefault();
    this.setState((prevState: IState) => ({
      showPassword: !prevState.showPassword
    }));
    const pwRef = this.passwordInputRef.current;
    if (pwRef) {
      pwRef.focus();
    }
  };

  protected handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    const { client } = this.props;
    const { username, password } = this.state;

    this.setState(() => ({ isLoading: true }));

    try {
      const getAuthParamsOutput = await client.query({
        query: gql`
          query GetUserAuthParams($username: String!) {
            getUserAuthParams(username: $username) {
              pwFunc
              pwFuncOptions {
                nonce
                cost
              }
            }
          }
        `,
        variables: {
          username
        },
        fetchPolicy: "no-cache"
      });

      if (getAuthParamsOutput.data.getUserAuthParams.pwFunc !== "pbkdf2") {
        throw new Error(`Only pbkdf2 supported.`);
      }
      const {
        nonce,
        cost
      } = getAuthParamsOutput.data.getUserAuthParams.pwFuncOptions;
      const { pw } = await Crypt.deriveMasterKeys(
        username,
        password,
        nonce,
        cost
      );

      // todo CRYPTO KEYS

      const loginOutput = await client.mutate({
        mutation: gql`
          mutation SignInUser($data: SignInUserInput!) {
            signInUser(data: $data) {
              jwt
              user {
                uuid
                username
              }
            }
          }
        `,
        variables: { data: { username, pwh: pw } },
        fetchPolicy: "no-cache"
      });
      const { cookies, NODE_ENV, setName, login } = this.props;
      cookies.set("jwt", loginOutput.data.signInUser.jwt, {
        path: "/",
        secure: NODE_ENV === "production",
        sameSite: true
      });
      setName(loginOutput.data.signInUser.user.username);
      this.setState(() => ({ isLoading: false }));
      login(loginOutput.data.signInUser.user.uuid);
    } catch (err) {
      if (
        err.graphQLErrors &&
        err.graphQLErrors[0].extensions &&
        err.graphQLErrors[0].extensions.exception
      ) {
        console.log(err.graphQLErrors[0].extensions.exception);

        const { message } = err.graphQLErrors[0].extensions.exception[0];
        this.setState(() => ({
          hasError: true,
          errorMessage: message
        }));
      } else if (err.networkError) {
        this.setState(() => ({
          errorMessage: err.networkError
        }));
      } else {
        this.setState(() => ({
          errorMessage: err.message
        }));
      }
      this.setState(() => ({ isLoading: false }));
    }
  };
}

const mapStateToProps = (state: IRootState) => ({
  NODE_ENV: state.environment.NODE_ENV,
  userId: state.userUniversal.userId
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  login: (userId: string) => dispatch(setUserId(userId)),
  setName: (username: string) => dispatch(setUserName(username))
});

export const LogIn = connect(
  mapStateToProps,
  mapDispatchToProps
)(withCookies(withApollo(LogInController)));
