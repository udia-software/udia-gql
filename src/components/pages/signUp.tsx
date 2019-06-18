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
import { ICryptoKey } from "../../graphql/schema";
import {
  IRootState,
  ISetUserIDAction,
  ISetUserNameAction,
  setUserId,
  setUserName
} from "../../modules/configureReduxStore";
import Crypt from "../../modules/crypt";
import { LocalForageContext } from "../../modules/localForageContext";
import {
  IErrorMessage,
  isEmailValid,
  isUsernameValid
} from "../../modules/validators";
import { EmailFormField } from "../composite/emailFormField";
import { LoadingOverlay } from "../composite/loadingOverlay";
import { PasswordFormField } from "../composite/passwordFormField";
import { UsernameFormField } from "../composite/usernameFormField";
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
  email: string;
  password: string;
  focusedElement: string;
  isLoading: boolean;
  loadingText: string;
  unameLengthOK: boolean;
  unameSpaceOK: boolean;
  unameValidated?: boolean;
  emailAppearsOK: boolean;
  emailValidated?: boolean;
  pwLengthOK: boolean;
  pwLowerOK: boolean;
  pwUpperOK: boolean;
  pwNumberOK: boolean;
  pwSpecialOK: boolean;
  pwValidated?: boolean;
  showPassword: boolean;
  rememberUser: boolean;
  hasError: boolean;
  errorMessage: string;
}

interface IProps {
  client: ApolloClient<{}>;
  cookies: Cookies;
  NODE_ENV: string;
  userId?: string;
  login: (userId: string) => ISetUserIDAction;
  setName: (username: string) => ISetUserNameAction;
}

class SignUpController extends Component<IProps, IState> {
  public static contextType = LocalForageContext;
  public context!: React.ContextType<typeof LocalForageContext>;

  private TIP_TIMEOUT_MS = 200;
  private usernameInputRef: RefObject<HTMLInputElement>;
  private passwordInputRef: RefObject<HTMLInputElement>;
  private emailInputRef: RefObject<HTMLInputElement>;
  private isRedirecting: boolean;

  constructor(props: IProps) {
    super(props);
    this.state = {
      username: "",
      email: "",
      password: "",
      focusedElement: "",
      isLoading: false,
      loadingText: "",
      unameLengthOK: false,
      unameSpaceOK: false,
      emailAppearsOK: false,
      pwLengthOK: false,
      pwLowerOK: false,
      pwUpperOK: false,
      pwNumberOK: false,
      pwSpecialOK: false,
      showPassword: false,
      rememberUser: false,
      hasError: false,
      errorMessage: ""
    };
    this.usernameInputRef = createRef();
    this.emailInputRef = createRef();
    this.passwordInputRef = createRef();
    this.isRedirecting = false;
  }

  public render() {
    const {
      username,
      email,
      password,
      focusedElement,
      isLoading,
      loadingText,
      unameLengthOK,
      unameSpaceOK,
      unameValidated,
      emailAppearsOK,
      emailValidated,
      pwLengthOK,
      pwLowerOK,
      pwUpperOK,
      pwNumberOK,
      pwSpecialOK,
      pwValidated,
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
      (typeof pwValidated !== "undefined" && !pwValidated) ||
      (typeof unameValidated !== "undefined" && !unameValidated) ||
      (!!email && !emailValidated);
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
          <title>Sign Up - UDIA</title>
          <meta name="description" content="Create a new account, User." />
        </Helmet>
        <H1 gridArea={"title"}>Sign Up</H1>
        <Form
          gridArea={"form"}
          autoComplete="off"
          method="post"
          onSubmit={this.handleSubmit}
        >
          <FormFieldset>
            <FormLegend>Hello there, User.</FormLegend>
            <UsernameFormField
              unameValidated={unameValidated}
              handleInputChange={this.handleInputChange}
              handleInputFocus={this.handleInputFocus}
              handleInputBlur={this.handleInputBlur}
              username={username}
              isLoading={isLoading}
              usernameInputRef={this.usernameInputRef}
              isFocusUsername={focusedElement === "username"}
              tipTimeout={this.TIP_TIMEOUT_MS}
              unameLengthOK={unameLengthOK}
              unameSpaceOK={unameSpaceOK}
            />
            <EmailFormField
              emailValidated={emailValidated}
              handleInputChange={this.handleInputChange}
              handleInputFocus={this.handleInputFocus}
              handleInputBlur={this.handleInputBlur}
              email={email}
              isLoading={isLoading}
              emailInputRef={this.emailInputRef}
              isFocusEmail={focusedElement === "email"}
              tipTimeout={this.TIP_TIMEOUT_MS}
              emailAppearsOK={emailAppearsOK}
            />
            <PasswordFormField
              pwValidated={pwValidated}
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
              pwLengthOK={pwLengthOK}
              pwLowerOK={pwLowerOK}
              pwUpperOK={pwUpperOK}
              pwNumberOK={pwNumberOK}
              pwSpecialOK={pwSpecialOK}
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
        <Link to="/log-in">I already have an account →</Link>
      </Center>
    );
  }

  protected handleInputChange: ChangeEventHandler<HTMLInputElement> = e => {
    const stateDiff = { [e.currentTarget.name]: e.currentTarget.value };
    const checkDiff = { [e.currentTarget.name]: e.currentTarget.checked };
    if ("username" in stateDiff) {
      const username = stateDiff.username.normalize("NFKC");
      this.validateUsername(username);
      this.setState(() => ({ username }));
    }
    if ("email" in stateDiff) {
      const email = stateDiff.email.normalize("NFKC");
      this.validateEmail(email);
      this.setState(() => ({ email }));
    }
    if ("password" in stateDiff) {
      const password = stateDiff.password.normalize("NFKC");
      this.validatePassword(password);
      this.setState(() => ({ password }));
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
      this.setState(({ unameLengthOK, unameSpaceOK }) => ({
        focusedElement: "",
        unameValidated: unameLengthOK && unameSpaceOK
      }));
    } else if (focusedElement === "email") {
      this.setState(({ emailAppearsOK }) => ({
        focusedElement: "",
        emailValidated: emailAppearsOK
      }));
    } else if (focusedElement === "password") {
      this.setState(({ pwLengthOK }) => ({
        focusedElement: "",
        pwValidated: pwLengthOK
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
    const { username, email, password } = this.state;
    const isValid =
      this.validateUsername(username) &&
      this.validateEmail(email) &&
      this.validatePassword(password);
    if (!isValid) {
      return;
    }

    this.setState(() => ({
      isLoading: true,
      loadingText: "Deriving cryptographic keys..."
    }));

    const nonce = await Crypt.generateNonce();
    const pwCost = 100000;
    const pwFunc = "pbkdf2";
    const { pw, ek } = await Crypt.deriveMasterKeys(
      username,
      password,
      nonce,
      pwCost
    );

    this.setState(() => ({
      loadingText: "Create and encrypt item keys..."
    }));
    const signKeyPair = Crypt.generateSigningKeyPair();
    const encryptKeyPair = Crypt.generateEncryptionKeyPair();
    const encSecretSignKey = Crypt.symmetricEncrypt(
      signKeyPair.secretSignKey,
      ek
    );
    const encSecretEncKey = Crypt.symmetricEncrypt(
      encryptKeyPair.secretEncKey,
      ek
    );

    const signKeyPayload: ICryptoKey = {
      publicKey: signKeyPair.publicSignKey,
      encKeyPayload: encSecretSignKey
    };
    const encryptKeyPayload: ICryptoKey = {
      publicKey: encryptKeyPair.publicEncKey,
      encKeyPayload: encSecretEncKey
    };

    this.setState(() => ({
      loadingText: "Creating new user..."
    }));
    let userId: string | undefined;
    try {
      const output = await client.mutate({
        mutation: gql`
          mutation CreateUser($data: CreateUserInput!) {
            createUser(data: $data) {
              jwt
              user {
                uuid
                username
              }
            }
          }
        `,
        variables: {
          data: {
            username,
            email: email || undefined,
            pwh: pw,
            pwFunc,
            pwFuncOptions: {
              cost: pwCost,
              nonce
            },
            signKeyPayload,
            encryptKeyPayload
          }
        },
        fetchPolicy: "no-cache"
      });
      const { jwt, user } = output.data.createUser;

      this.setState(() => ({
        loadingText: "Persisting item keys..."
      }));
      await this.context.setItem("signKeyPair", signKeyPair);
      await this.context.setItem("encryptKeyPair", encryptKeyPair);

      const { setName } = this.props;
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
      if (
        err.graphQLErrors &&
        err.graphQLErrors[0] &&
        err.graphQLErrors[0].extensions &&
        err.graphQLErrors[0].extensions.exception &&
        err.graphQLErrors[0].extensions.exception[0]
      ) {
        const { message, key } = err.graphQLErrors[0].extensions.exception[0];

        switch (key) {
          case "username":
            if (this.usernameInputRef && this.usernameInputRef.current) {
              this.usernameInputRef.current.focus();
            }
            break;
          case "email":
            if (this.emailInputRef && this.emailInputRef.current) {
              this.emailInputRef.current.focus();
            }
            break;
          case "password":
            if (this.passwordInputRef && this.passwordInputRef.current) {
              this.passwordInputRef.current.focus();
            }
            break;
          default:
            break;
        }

        this.setState(() => ({
          hasError: true,
          focusedElement: key,
          unameValidated: key !== "username",
          emailValidated: key !== "email",
          errorMessage: message
        }));
      } else if (err.message) {
        this.setState(() => ({
          hasError: true,
          errorMessage: err.message
        }));
      } else {
        this.setState(() => ({
          hasError: true,
          errorMessage: err.toString()
        }));
      }
    } finally {
      this.setState(() => ({ isLoading: false }));
      if (userId) {
        this.props.login(userId);
      }
    }
  };

  /**
   * Quick client side validation of the username
   * - length between 3 and 24
   * - contains no whitespace characters
   */
  private validateUsername = (usernameInput: string) => {
    const errors: IErrorMessage[] = [];
    let unameLengthOK = true;
    let unameSpaceOK = true;

    if (!isUsernameValid(usernameInput, errors)) {
      for (const { message } of errors) {
        if (
          message.indexOf("is too long") >= 0 ||
          message.indexOf("is too short") >= 0
        ) {
          unameLengthOK = false;
        } else if (message.indexOf("should not contain whitespace") >= 0) {
          unameSpaceOK = false;
        }
      }
    }
    const unameValidated = unameLengthOK && unameSpaceOK;
    this.setState(() => ({
      unameLengthOK,
      unameSpaceOK,
      unameValidated
    }));
    return unameValidated;
  };

  /**
   * Quick client check of the email
   */
  private validateEmail = (emailInput: string) => {
    const errors: IErrorMessage[] = [];
    let emailAppearsOK = true;
    if (!isEmailValid(emailInput, errors)) {
      for (const { message } of errors) {
        if (message.indexOf("syntactically invalid") >= 0) {
          emailAppearsOK = false;
        }
      }
    }
    this.setState(() => ({
      emailAppearsOK,
      emailValidated: emailAppearsOK
    }));
    return emailInput ? emailAppearsOK : true;
  };

  /**
   * Quick client side validation of the password
   * - min length 8
   * - upper case char exists
   * - lower case char exists
   * - special character exists
   * - number exists
   */
  private validatePassword = (passwordInput: string) => {
    const pwLengthOK = !!passwordInput && passwordInput.length > 7;
    const pwLowerOK =
      !!passwordInput && passwordInput.toUpperCase() !== passwordInput;
    const pwUpperOK =
      !!passwordInput && passwordInput.toLowerCase() !== passwordInput;
    const pwNumberOK = !!passwordInput && /[0-9]+/.test(passwordInput);
    const pwSpecialOK =
      !!passwordInput && !/^[a-zA-Z0-9]+$/.test(passwordInput);
    this.setState(() => ({
      pwLengthOK,
      pwLowerOK,
      pwUpperOK,
      pwNumberOK,
      pwSpecialOK,
      pwValidated: pwLengthOK // only length mandatory
    }));
    return pwLengthOK;
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

export const SignUp = connect(
  mapStateToProps,
  mapDispatchToProps
)(withCookies(withApollo(SignUpController)));
