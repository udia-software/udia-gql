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
import { Helmet } from "react-helmet-async";
import { ICryptoKey } from "../../graphql/schema";
import Crypt from "../../modules/crypt";
import {
  IErrorMessage,
  isEmailValid,
  isUsernameValid
} from "../../modules/validators";
import { EmailFormField } from "../composite/emailFormField";
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
}

class SignUpController extends Component<IProps, IState> {
  private TIP_TIMEOUT_MS = 200;
  private usernameInputRef: RefObject<HTMLInputElement>;
  private passwordInputRef: RefObject<HTMLInputElement>;

  constructor(props: IProps) {
    super(props);
    this.state = {
      username: "",
      email: "",
      password: "",
      focusedElement: "",
      isLoading: false,
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
    this.passwordInputRef = createRef();
  }

  public render() {
    const {
      username,
      email,
      password,
      focusedElement,
      isLoading,
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
    // if (this.props.user && !isLoading) {
    //   if (!this.isRedirecting) {
    //     this.isRedirecting = true;
    //     return <Redirect to="/" />;
    //   }
    // }

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
      <Center>
        <Helmet>
          <title>Sign Up - UDIA</title>
          <meta name="description" content="Create a new account, User." />
        </Helmet>
        <H1>Sign Up</H1>
        <Form autoComplete="off" method="post" onSubmit={this.handleSubmit}>
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

    this.setState(() => ({ isLoading: true }));

    const nonce = await Crypt.generateNonce();
    const pwCost = 100000;
    const pwFunc = "pbkdf2";
    const { pw, ek } = await Crypt.deriveMasterKeys(
      username,
      password,
      nonce,
      pwCost
    );
    const { publicSignKey, secretSignKey } = Crypt.generateSigningKeyPair();
    const { publicEncKey, secretEncKey } = Crypt.generateEncryptionKeyPair();
    const encSecretSignKey = Crypt.symmetricEncrypt(secretSignKey, ek);
    const encSecretEncKey = Crypt.symmetricEncrypt(secretEncKey, ek);

    const signKeyPayload: ICryptoKey = {
      publicKey: publicSignKey,
      encKeyPayload: encSecretSignKey
    };
    const encryptKeyPayload: ICryptoKey = {
      publicKey: publicEncKey,
      encKeyPayload: encSecretEncKey
    };

    try {
      const output = await client.mutate({
        mutation: gql`
          mutation CreateUser($data: CreateUserInput!) {
            createUser(data: $data) {
              jwt
              user {
                uuid
                createdAt
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
        }
      });
      // tslint:disable-next-line: no-console
      console.log(output.data.createUser);

    } catch (err) {
      if (err.graphQLErrors && err.graphQLErrors[0].extensions && err.graphQLErrors[0].extensions.exception) {
        const { message, key } = err.graphQLErrors[0].extensions.exception[0];
        this.setState(() => ({
          hasError: true,
          focusedElement: key,
          unameValidated: key !== "username",
          emailValidated: key !== "email",
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
    } finally {
      this.setState(() => ({ isLoading: false }));
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

export const SignUp = withApollo(SignUpController);
