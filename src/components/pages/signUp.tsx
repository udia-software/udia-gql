import React, {
  ChangeEventHandler,
  Component,
  createRef,
  FocusEventHandler,
  FormEventHandler,
  MouseEventHandler,
  RefObject
} from "react";
import { Helmet } from "react-helmet-async";
import { connect } from "react-redux";
import { IErrorMessage, isUsernameValid, isEmailValid } from "../../modules/validators";
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
  isLoading: boolean;
  isFocusUsername: boolean;
  unameLengthOK: boolean;
  unameSpaceOK: boolean;
  unameValidated?: boolean;
  isFocusEmail: boolean;
  emailAppearsOK: boolean;
  emailValidated?: boolean;
  isFocusPassword: boolean;
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

class SignUpController extends Component<{}, IState> {
  private TIP_TIMEOUT_MS = 200;
  private usernameInputRef: RefObject<HTMLInputElement>;
  private passwordInputRef: RefObject<HTMLInputElement>;

  constructor(props: {}) {
    super(props);
    this.state = {
      username: "",
      email: "",
      password: "",
      isLoading: false,
      isFocusUsername: false,
      unameLengthOK: false,
      unameSpaceOK: false,
      isFocusEmail: false,
      emailAppearsOK: false,
      isFocusPassword: false,
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
      isLoading,
      isFocusUsername,
      unameLengthOK,
      unameSpaceOK,
      unameValidated,
      isFocusEmail,
      emailAppearsOK,
      emailValidated,
      isFocusPassword,
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
      (typeof unameValidated !== "undefined" && !unameValidated);
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
              isFocusUsername={isFocusUsername}
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
              isFocusEmail={isFocusEmail}
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
              isFocusPassword={isFocusPassword}
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
    if (focusedElement === "username") {
      this.setState(() => ({ isFocusUsername: true }));
    } else if (focusedElement === "email") {
      this.setState(() => ({ isFocusEmail: true }));
    } else if (focusedElement === "password") {
      this.setState(() => ({ isFocusPassword: true }));
    }
  };

  protected handleInputBlur: FocusEventHandler<HTMLInputElement> = e => {
    const focusedElement = e.currentTarget.name;
    if (focusedElement === "username") {
      this.setState(({ unameLengthOK, unameSpaceOK }) => ({
        isFocusUsername: false,
        unameValidated: unameLengthOK && unameSpaceOK
      }));
    } else if (focusedElement === "email") {
      this.setState(({ emailAppearsOK }) => ({
        isFocusEmail: false,
        emailValidated: emailAppearsOK
      }));
    } else if (focusedElement === "password") {
      this.setState(({ pwLengthOK }) => ({
        isFocusPassword: false,
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
    return;
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
    this.setState(() => ({
      unameLengthOK,
      unameSpaceOK,
      unameValidated: unameLengthOK && unameSpaceOK
    }));
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
    this.setState(() =>({
      emailAppearsOK,
      emailValidated: emailAppearsOK
    }))
  }

  /**
   * Quick client side validation of the password
   * - min length 8
   * - upper case char exists
   * - lower case char exists
   * - special character exists
   * - number exists
   */
  private validatePassword = (passwordInput: string) => {
    this.setState(() => {
      const pwLengthOK = !!passwordInput && passwordInput.length > 7;
      const pwLowerOK =
        !!passwordInput && passwordInput.toUpperCase() !== passwordInput;
      const pwUpperOK =
        !!passwordInput && passwordInput.toLowerCase() !== passwordInput;
      const pwNumberOK = !!passwordInput && /[0-9]+/.test(passwordInput);
      const pwSpecialOK =
        !!passwordInput && !/^[a-zA-Z0-9]+$/.test(passwordInput);
      return {
        pwLengthOK,
        pwLowerOK,
        pwUpperOK,
        pwNumberOK,
        pwSpecialOK,
        pwValidated: pwLengthOK // only length mandatory
      };
    });
  };
}

const mapStateToProps = () => ({});

const SignUp = connect(mapStateToProps)(SignUpController);

export { SignUp };
