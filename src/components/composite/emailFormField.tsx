import React, { ChangeEventHandler, FocusEventHandler } from "react";
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
  emailValidated?: boolean;
  handleInputChange: ChangeEventHandler<HTMLInputElement>;
  handleInputFocus: FocusEventHandler<HTMLInputElement>;
  handleInputBlur: FocusEventHandler<HTMLInputElement>;
  email: string;
  isLoading: boolean;
  emailInputRef: RefObject<HTMLInputElement>;
  isFocusEmail: boolean;
  tipTimeout: number;
  emailAppearsOK: boolean;
}
export const EmailFormField = ({
  emailValidated,
  handleInputChange,
  handleInputFocus,
  handleInputBlur,
  email,
  isLoading,
  emailInputRef,
  isFocusEmail,
  tipTimeout,
  emailAppearsOK
}: IProps) => (
  <FormField>
    <FormLabel>
      <FormLabelContent>
        <span>
          Email {!email && "(Optional)"}
          {email &&
            typeof emailValidated !== "undefined" &&
            (emailValidated ? (
              <GreenIcon icon="check" />
            ) : (
              <RedIcon icon="times" />
            ))}
        </span>
      </FormLabelContent>
      <FormInput
        autoComplete="off"
        type="email"
        name="email"
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        value={email}
        disabled={isLoading}
        ref={emailInputRef}
      />
      <TransitionGroup>
        {(isFocusEmail ||
          (email && typeof emailValidated !== "undefined" && !emailValidated)) && (
          <CSSTransition
            classNames="fade"
            timeout={tipTimeout}
            unmountOnExit={true}
          >
            <FormOutput>
              <UnstyledList>
                <CenteredListItem>
                  <code>email appears ok</code>
                  {emailAppearsOK ? (
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
