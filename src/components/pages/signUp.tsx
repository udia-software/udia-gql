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
import { connect } from "react-redux";
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
  unameLengthOK: boolean;
  unameSpaceOK: boolean;
  unameValidated?: boolean;
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
      password: "",
      isLoading: false,
      isFocusUsername: false,
      unameLengthOK: false,
      unameSpaceOK: false,
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
      password,
      isLoading,
      isFocusUsername,
      unameLengthOK,
      unameSpaceOK,
      unameValidated,
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
            <FormField>
              <FormLabel>
                <FormLabelContent>
                  <span>
                    Username{" "}
                    {typeof unameValidated !== "undefined" &&
                      (unameValidated ? (
                        <GreenIcon icon="check" />
                      ) : (
                          <RedIcon icon="times" />
                        ))}
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
                    (typeof unameValidated !== "undefined" &&
                      !unameValidated)) && (
                      <CSSTransition
                        classNames="fade"
                        timeout={this.TIP_TIMEOUT_MS}
                        unmountOnExit={true}
                      >
                        <FormOutput>
                          <UnstyledList>
                            <CenteredListItem>
                              <code>2 &lt; len(uname) &lt; 21</code>
                              {unameLengthOK ? (
                                <GreenIcon icon="check" />
                              ) : (
                                  <RedIcon icon="times" />
                                )}
                            </CenteredListItem>
                            <CenteredListItem>
                              <code>space not in uname</code>
                              {unameSpaceOK ? (
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
                    {typeof pwValidated !== "undefined" &&
                      (pwValidated ? (
                        <GreenIcon icon="check" />
                      ) : (
                          <RedIcon icon="times" />
                        ))}
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
                    (typeof pwValidated !== "undefined" && !pwValidated)) && (
                      <CSSTransition
                        classNames="fade"
                        timeout={this.TIP_TIMEOUT_MS}
                        unmountOnExit={true}
                      >
                        <FormOutput>
                          <UnstyledList>
                            <CenteredListItem>
                              <code>len(pw) &gt; 7</code>
                              {pwLengthOK ? (
                                <GreenIcon icon="check" />
                              ) : (
                                  <RedIcon icon="times" />
                                )}
                            </CenteredListItem>
                            <CenteredListItem>
                              <code>lowercase in pw</code>
                              {pwLowerOK ? (
                                <GreenIcon icon="check" />
                              ) : (
                                  <RedIcon icon="times" />
                                )}
                            </CenteredListItem>
                            <CenteredListItem>
                              <code>uppercase in pw</code>
                              {pwUpperOK ? (
                                <GreenIcon icon="check" />
                              ) : (
                                  <RedIcon icon="times" />
                                )}
                            </CenteredListItem>
                            <CenteredListItem>
                              <code>number in pw</code>
                              {pwNumberOK ? (
                                <GreenIcon icon="check" />
                              ) : (
                                  <RedIcon icon="times" />
                                )}
                            </CenteredListItem>
                            <CenteredListItem>
                              <code>special in pw</code>
                              {pwSpecialOK ? (
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
        <Link to="/log-in">I already have an account →</Link>
      </Center>
    );
  }

  protected handleInputChange: ChangeEventHandler<HTMLInputElement> = e => {
    const stateDiff = { [e.currentTarget.name]: e.currentTarget.value };
    const checkDiff = { [e.currentTarget.name]: e.currentTarget.checked };
    if ("password" in stateDiff) {
      this.validatePassword(stateDiff.password);
      this.setState(() => ({ password: stateDiff.password }));
    }
    if ("username" in stateDiff) {
      this.validateUsername(stateDiff.username);
      this.setState(() => ({ username: stateDiff.username }));
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
      this.setState(({ unameLengthOK, unameSpaceOK }) => {
        return {
          isFocusUsername: false,
          unameValidated: unameLengthOK && unameSpaceOK
        };
      });
    } else if (focusedElement === "password") {
      this.setState(
        ({ pwLengthOK, pwLowerOK, pwNumberOK, pwSpecialOK, pwUpperOK }) => {
          return {
            isFocusPassword: false,
            pwValidated:
              pwLengthOK && pwLowerOK && pwNumberOK && pwSpecialOK && pwUpperOK
          };
        }
      );
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
   * - length between 3 and 28
   * - contains no whitespace characters
   */
  private validateUsername = (usernameInput: string) => {
    this.setState(() => {
      const unameLengthOK =
        !!usernameInput &&
        usernameInput.length >= 3 &&
        usernameInput.length <= 20;
      const unameSpaceOK = !!usernameInput && !/\s/giu.test(usernameInput);
      return {
        unameLengthOK,
        unameSpaceOK,
        unameValidated: unameLengthOK && unameSpaceOK
      };
    });
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
    this.setState(() => {
      const pwLengthOK = !!passwordInput && passwordInput.length >= 8;
      const pwLowerOK =
        !!passwordInput && passwordInput.toUpperCase() !== passwordInput;
      const pwUpperOK =
        !!passwordInput && passwordInput.toLowerCase() !== passwordInput;
      const pwNumberOK = !!passwordInput && /[0-9]+/.test(passwordInput);
      const pwSpecialOK =
        !!passwordInput && !/^[a-zA-Z0-9]+$/.test(passwordInput);
      const pwValidated =
        pwLengthOK && pwLowerOK && pwUpperOK && pwNumberOK && pwSpecialOK;
      return {
        pwLengthOK,
        pwLowerOK,
        pwUpperOK,
        pwNumberOK,
        pwSpecialOK,
        pwValidated
      };
    });
  };
}

const mapStateToProps = () => ({});

const SignUp = connect(mapStateToProps)(SignUpController);

export { SignUp };
