import React, { ChangeEventHandler, FocusEventHandler, RefObject } from "react";
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
import { GreenIcon, RedIcon } from "../static/themedHelpers";

interface IProps {
  unameValidated?: boolean;
  handleInputChange: ChangeEventHandler<HTMLInputElement>;
  handleInputFocus: FocusEventHandler<HTMLInputElement>;
  handleInputBlur: FocusEventHandler<HTMLInputElement>;
  username: string;
  isLoading: boolean;
  usernameInputRef: RefObject<HTMLInputElement>;
  isFocusUsername: boolean;
  tipTimeout: number;
  unameLengthOK: boolean;
  unameSpaceOK: boolean;
}

export const UsernameFormField = ({
  unameValidated,
  handleInputChange,
  handleInputFocus,
  handleInputBlur,
  username,
  isLoading,
  usernameInputRef,
  isFocusUsername,
  tipTimeout,
  unameLengthOK,
  unameSpaceOK
}: IProps) => (
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
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        value={username}
        disabled={isLoading}
        ref={usernameInputRef}
      />
      <TransitionGroup>
        {(isFocusUsername ||
          (typeof unameValidated !== "undefined" && !unameValidated)) && (
          <CSSTransition
            classNames="fade"
            timeout={tipTimeout}
            unmountOnExit={true}
          >
            <FormOutput>
              <UnstyledList>
                <CenteredListItem>
                  <code>2 &lt; len(uname) &lt; 25</code>
                  {unameLengthOK ? (
                    <GreenIcon icon="check-circle" />
                  ) : (
                    <RedIcon icon="times-circle" />
                  )}
                </CenteredListItem>
                <CenteredListItem>
                  <code>space not in uname</code>
                  {unameSpaceOK ? (
                    <GreenIcon icon="check-circle" />
                  ) : (
                    <RedIcon icon="times-circle" />
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
  unameExists?: boolean;
  handleInputChange: ChangeEventHandler<HTMLInputElement>;
  handleInputFocus: FocusEventHandler<HTMLInputElement>;
  handleInputBlur: FocusEventHandler<HTMLInputElement>;
  username: string;
  isLoading: boolean;
  usernameInputRef: RefObject<HTMLInputElement>;
  isFocusUsername: boolean;
  tipTimeout: number;
}

export const LoginUsernameFormField = ({
  unameExists,
  handleInputChange,
  handleInputFocus,
  handleInputBlur,
  username,
  isLoading,
  usernameInputRef,
  isFocusUsername,
  tipTimeout
}: ILoginProps) => (
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
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        value={username}
        disabled={isLoading}
        ref={usernameInputRef}
      />
      <TransitionGroup>
        {(isFocusUsername ||
          (typeof unameExists !== "undefined" && !unameExists)) && (
          <CSSTransition
            classNames="fade"
            timeout={tipTimeout}
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
);
