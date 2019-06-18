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
import Crypt, { IEncryptKeyPair, ISignKeyPair } from "../../modules/crypt";
import { LocalForageContext } from "../../modules/localForageContext";
import { LoadingOverlay } from "../composite/loadingOverlay";
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
  loadingText: string;
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
  public static contextType = LocalForageContext;
  public context!: React.ContextType<typeof LocalForageContext>;

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
      loadingText: "",
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
      loadingText,
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
      <Center gridTemplateAreas={`"title" "form" "links";`}>
        <LoadingOverlay
          gridArea={"form"}
          loading={isLoading}
          loadingText={loadingText}
        />
        <Helmet>
          <title>Log In - UDIA</title>
          <meta name="description" content="Log into your account, User." />
        </Helmet>
        <H1 gridArea={"title"}>Log In</H1>
        <Form
          gridArea={"form"}
          autoComplete="off"
          method="POST"
          onSubmit={this.handleSubmit}
        >
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
        <div>
          <Link to="/sign-up">← I do not have an account</Link>
        </div>
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

    this.setState(() => ({
      isLoading: true,
      loadingText: "Getting authentication parameters..."
    }));
    let userId: string | undefined;
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

      this.setState(() => ({
        loadingText: "Deriving cryptographic keys..."
      }));
      const { pw, ek } = await Crypt.deriveMasterKeys(
        username,
        password,
        nonce,
        cost
      );

      // todo CRYPTO KEYS
      this.setState(() => ({
        loadingText: "Fetching authentication token..."
      }));
      const loginOutput = await client.mutate({
        mutation: gql`
          mutation SignInUser($data: SignInUserInput!) {
            signInUser(data: $data) {
              jwt
              user {
                uuid
                username
                signKeyPayload {
                  publicKey
                  encKeyPayload {
                    enc
                    nonce
                  }
                }
                encryptKeyPayload {
                  publicKey
                  encKeyPayload {
                    enc
                    nonce
                  }
                }
              }
            }
          }
        `,
        variables: { data: { username, pwh: pw } },
        fetchPolicy: "no-cache"
      });
      const { jwt, user } = loginOutput.data.signInUser;
      const { setName } = this.props;

      this.setState(() => ({
        loadingText: "Decrypting item keys..."
      }));
      const {
        enc: signEnc,
        nonce: signNonce
      } = user.signKeyPayload.encKeyPayload;
      const secretSignKey = Crypt.symmetricDecrypt(
        signEnc,
        signNonce,
        ek
      ) as string;
      const signKeyPair: ISignKeyPair = {
        publicSignKey: user.signKeyPayload.publicKey,
        secretSignKey
      };
      await this.context.setItem("signKeyPair", signKeyPair);
      const {
        enc: encryptEnc,
        nonce: encryptNonce
      } = user.encryptKeyPayload.encKeyPayload;
      const secretEncKey = Crypt.symmetricDecrypt(
        encryptEnc,
        encryptNonce,
        ek
      ) as string;
      const encryptKeyPair: IEncryptKeyPair = {
        publicEncKey: user.encryptKeyPayload.publicKey,
        secretEncKey
      };
      await this.context.setItem("encryptKeyPair", encryptKeyPair);

      this.setState(() => ({
        loadingText: "Persisting authentication token..."
      }));
      await fetch("/resource/jwt", {
        method: "POST",
        mode: "same-origin",
        cache: "no-cache",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        redirect: "follow",
        body: JSON.stringify({ jwt })
      });

      setName(user.username);
      userId = user.uuid;
    } catch (err) {
      let errorMessage: string;
      if (
        err.graphQLErrors &&
        err.graphQLErrors[0] &&
        err.graphQLErrors[0].extensions &&
        err.graphQLErrors[0].extensions.exception &&
        err.graphQLErrors[0].extensions.exception[0]
      ) {
        const { message } = err.graphQLErrors[0].extensions.exception[0];
        errorMessage = message;
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = err.toString();
      }
      this.setState(() => ({
        hasError: true,
        errorMessage
      }));
    } finally {
      this.setState(() => ({ isLoading: false }));
      if (userId) {
        this.props.login(userId);
      }
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
