import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, {
  ChangeEventHandler,
  FocusEventHandler,
  MouseEventHandler,
  RefObject
} from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import {
  CenteredListItem,
  FormField,
  FormInput,
  FormLabel,
  FormLabelContent,
  FormOutput,
  UnstyledList
} from "../static/formHelpers";
import { A, GreenIcon, RedIcon, YellowIcon } from "../static/themedHelpers";

interface IProps {
  pwValidated?: boolean;
  showPassword: boolean;
  toggleShowPassword: MouseEventHandler<HTMLAnchorElement>;
  handleInputChange: ChangeEventHandler<HTMLInputElement>;
  handleInputFocus: FocusEventHandler<HTMLInputElement>;
  handleInputBlur: FocusEventHandler<HTMLInputElement>;
  password: string;
  isLoading: boolean;
  passwordInputRef: RefObject<HTMLInputElement>;
  isFocusPassword: boolean;
  tipTimeout: number;
  pwLengthOK: boolean;
  pwLowerOK: boolean;
  pwUpperOK: boolean;
  pwNumberOK: boolean;
  pwSpecialOK: boolean;
}

export const PasswordFormField = ({
  pwValidated,
  showPassword,
  toggleShowPassword,
  handleInputChange,
  handleInputFocus,
  handleInputBlur,
  password,
  isLoading,
  passwordInputRef,
  isFocusPassword,
  tipTimeout,
  pwLengthOK,
  pwLowerOK,
  pwUpperOK,
  pwNumberOK,
  pwSpecialOK
}: IProps) => (
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
          <A style={{ userSelect: "none" }} onClick={toggleShowPassword}>
            Hide{" "}
            <FontAwesomeIcon style={{ height: "0.8em" }} icon="eye-slash" />
          </A>
        ) : (
          <A style={{ userSelect: "none" }} onClick={toggleShowPassword}>
            Show <FontAwesomeIcon style={{ height: "0.8em" }} icon="eye" />
          </A>
        )}
      </FormLabelContent>
      <FormInput
        autoComplete="off"
        type={showPassword ? "text" : "password"}
        name="password"
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        value={password}
        disabled={isLoading}
        ref={passwordInputRef}
      />
      <TransitionGroup>
        {(isFocusPassword ||
          (typeof pwValidated !== "undefined" && !pwValidated)) && (
          <CSSTransition
            classNames="fade"
            timeout={tipTimeout}
            unmountOnExit={true}
          >
            <FormOutput>
              <UnstyledList>
                <CenteredListItem>
                  <code>len(pw) &gt; 7</code>
                  {pwLengthOK ? (
                    <GreenIcon icon="check-circle" />
                  ) : (
                    <RedIcon icon="times-circle" />
                  )}
                </CenteredListItem>
                <CenteredListItem>
                  <code>lowercase in pw</code>
                  {pwLowerOK ? (
                    <GreenIcon icon="check-circle" />
                  ) : (
                    <YellowIcon icon="exclamation-triangle" />
                  )}
                </CenteredListItem>
                <CenteredListItem>
                  <code>uppercase in pw</code>
                  {pwUpperOK ? (
                    <GreenIcon icon="check-circle" />
                  ) : (
                    <YellowIcon icon="exclamation-triangle" />
                  )}
                </CenteredListItem>
                <CenteredListItem>
                  <code>number in pw</code>
                  {pwNumberOK ? (
                    <GreenIcon icon="check-circle" />
                  ) : (
                    <YellowIcon icon="exclamation-triangle" />
                  )}
                </CenteredListItem>
                <CenteredListItem>
                  <code>special in pw</code>
                  {pwSpecialOK ? (
                    <GreenIcon icon="check-circle" />
                  ) : (
                    <YellowIcon icon="exclamation-triangle" />
                  )}
                </CenteredListItem>
              </UnstyledList>
            </FormOutput>
          </CSSTransition>
        )}
      </TransitionGroup>
    </FormLabel>
  </FormField>
);

interface ILoginProps {
  pwExists?: boolean;
  showPassword: boolean;
  toggleShowPassword: MouseEventHandler<HTMLAnchorElement>;
  handleInputChange: ChangeEventHandler<HTMLInputElement>;
  handleInputFocus: FocusEventHandler<HTMLInputElement>;
  handleInputBlur: FocusEventHandler<HTMLInputElement>;
  password: string;
  isLoading: boolean;
  passwordInputRef: RefObject<HTMLInputElement>;
  isFocusPassword: boolean;
  tipTimeout: number;
}

export const LoginPasswordFormField = ({
  pwExists,
  showPassword,
  toggleShowPassword,
  handleInputChange,
  handleInputFocus,
  handleInputBlur,
  password,
  isLoading,
  passwordInputRef,
  isFocusPassword,
  tipTimeout
}: ILoginProps) => (
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
          <A style={{ userSelect: "none" }} onClick={toggleShowPassword}>
            Hide{" "}
            <FontAwesomeIcon style={{ height: "0.8em" }} icon="eye-slash" />
          </A>
        ) : (
          <A style={{ userSelect: "none" }} onClick={toggleShowPassword}>
            Show <FontAwesomeIcon style={{ height: "0.8em" }} icon="eye" />
          </A>
        )}
      </FormLabelContent>
      <FormInput
        autoComplete="off"
        type={showPassword ? "text" : "password"}
        name="password"
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        value={password}
        disabled={isLoading}
        ref={passwordInputRef}
      />
      <TransitionGroup>
        {(isFocusPassword ||
          (typeof pwExists !== "undefined" && !pwExists)) && (
          <CSSTransition
            classNames="fade"
            timeout={tipTimeout}
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
);
