import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Checkbox } from "../static/checkbox";
import {
  CenteredListItem,
  Form,
  FormField,
  FormFieldset,
  FormInput,
  FormLabel,
  FormLabelContent,
  FormLegend,
  FormOutput,
  SubmitButton,
  UnstyledList
} from "../static/formHelpers";
import { A, Center, GreenIcon, H1, Link, RedIcon } from "../static/themedHelpers";

interface IState {
  username: string;
  password: string;
  isLoading: boolean;
  isFocusUsername: boolean;
  unameExists?: boolean;
  isFocusPassword: boolean;
  pwExists?: boolean;
  showPassword: boolean;
  rememberUser: boolean;
  hasError: boolean;
  errorMessage: string;
}

class LogInController extends Component<{}, IState> {
  private TIP_TIMEOUT_MS = 200;
  private usernameInputRef: RefObject<HTMLInputElement>;
  private passwordInputRef: RefObject<HTMLInputElement>;

  constructor(props: {}) {
    super(props);
    this.state = {
      username: "",
      password: "",
      isLoading: false,
      isFocusUsername: false,
      isFocusPassword: false,
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
      password,
      isLoading,
      isFocusUsername,
      unameExists,
      isFocusPassword,
      pwExists,
      showPassword,
      rememberUser,
      hasError,
      errorMessage
    } = this.state;

    // if (this.props.user && !isLoading) {
    //   if (!this.isRedirecting) {
    //     this.isRedirecting = true;
    //     return <Redirect to="/" />;
    //   }
    // }

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
        <Form autoComplete="off" method="post" onSubmit={this.handleSubmit}>
          <FormFieldset>
            <FormLegend>Welcome back, User.</FormLegend>
            <FormField>
              <FormLabel>
                <FormLabelContent>
                  <span>
                    Username{" "}
                    {typeof unameExists !== "undefined" && !unameExists && (
                      <RedIcon icon="times" />
                    )}
                  </span>
                </FormLabelContent>
                <FormInput
                  autoComplete="off"
                  type="text"
                  name="username"
                  onChange={this.handleInputChange}
                  onFocus={this.handleInputFocus}
                  onBlur={this.handleInputBlur}
                  value={username}
                  disabled={isLoading}
                  ref={this.usernameInputRef}
                />
                <TransitionGroup>
                  {(isFocusUsername ||
                    (typeof unameExists !== "undefined" && !unameExists)) && (
                      <CSSTransition
                        classNames="fade"
                        timeout={this.TIP_TIMEOUT_MS}
                        unmountOnExit={true}
                      >
                        <FormOutput>
                          <UnstyledList>
                            <CenteredListItem>
                              <code>len(uname) &gt; 0</code>
                              {unameExists ? (
                                <GreenIcon icon="check" />
                              ) : (
                                  <RedIcon icon="times" />
                                )}
                            </CenteredListItem>
                          </UnstyledList>
                        </FormOutput>
                      </CSSTransition>
                    )}
                </TransitionGroup>
              </FormLabel>
            </FormField>
            <FormField>
              <FormLabel>
                <FormLabelContent>
                  <span>
                    Password{" "}
                    {typeof pwExists !== "undefined" && !pwExists && (
                      <RedIcon icon="times" />
                    )}
                  </span>
                  {showPassword ? (
                    <A
                      style={{ userSelect: "none" }}
                      onClick={this.toggleShowPassword}
                    >
                      Hide{" "}
                      <FontAwesomeIcon
                        style={{ height: "0.8em" }}
                        icon="eye-slash"
                      />
                    </A>
                  ) : (
                      <A
                        style={{ userSelect: "none" }}
                        onClick={this.toggleShowPassword}
                      >
                        Show{" "}
                        <FontAwesomeIcon style={{ height: "0.8em" }} icon="eye" />
                      </A>
                    )}
                </FormLabelContent>
                <FormInput
                  autoComplete="off"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={this.handleInputChange}
                  onFocus={this.handleInputFocus}
                  onBlur={this.handleInputBlur}
                  value={password}
                  disabled={isLoading}
                  ref={this.passwordInputRef}
                />
                <TransitionGroup>
                  {(isFocusPassword ||
                    (typeof pwExists !== "undefined" && !pwExists)) && (
                      <CSSTransition
                        classNames="fade"
                        timeout={this.TIP_TIMEOUT_MS}
                        unmountOnExit={true}
                      >
                        <FormOutput>
                          <UnstyledList>
                            <CenteredListItem>
                              <code>len(pw) &gt; 0</code>
                              {pwExists ? (
                                <GreenIcon icon="check" />
                              ) : (
                                  <RedIcon icon="times" />
                                )}
                            </CenteredListItem>
                          </UnstyledList>
                        </FormOutput>
                      </CSSTransition>
                    )}
                </TransitionGroup>
              </FormLabel>
            </FormField>
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
        password: stateDiff.password,
        pwExists: !!stateDiff.password
      }));
    }
    if ("username" in stateDiff) {
      this.setState(() => ({
        username: stateDiff.username,
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
    if (focusedElement === "username") {
      this.setState(() => ({ isFocusUsername: true }));
    } else if (focusedElement === "password") {
      this.setState(() => ({ isFocusPassword: true }));
    }
  };

  protected handleInputBlur: FocusEventHandler<HTMLInputElement> = e => {
    const focusedElement = e.currentTarget.name;
    if (focusedElement === "username") {
      this.setState(({ username }) => ({
        isFocusUsername: false,
        unameExists: !!username
      }));
    } else if (focusedElement === "password") {
      this.setState(({ password }) => ({
        isFocusPassword: false,
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
  };
}

export { LogInController as LogIn };
