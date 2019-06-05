import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEventHandler, Component } from "react";
import styled, { IThemeInterface } from "./appStyles";

// Label Container to hold the checkbox
const CheckboxLabelContainer = styled.span`
  padding: 0.2em;
  display: inline-block;
  vertical-align: middle;
`;

// Checkmark Icon
const Checkmark = styled(FontAwesomeIcon).attrs({ icon: "check" })`
`;

// Hide browser's default checkbox
const HiddenCheckboxInput = styled.input.attrs({ type: "checkbox" })`
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;
// Custom checkbox
const StyledCheckbox = styled.span`
  display: inline-block;
  width: 1em;
  height: 1em;
  background: ${(p: { checked: boolean, theme: IThemeInterface }) => {
    return p.checked ? p.theme.backgroundColor : p.theme.primaryColor;
  }};
  border-radius: 3px;
  transition: all 150ms;
  ${HiddenCheckboxInput}:focus + & {
    box-shadow: 0 0 0 0.2em ${({ theme }) => theme.purple};
  }
  ${Checkmark} {
    visibility: ${(p: { checked: boolean }) => p.checked ? "visible" : "hidden"};
  }
`;

interface IProps {
  handleChange: ChangeEventHandler<HTMLInputElement>;
  checked: boolean;
  name?: string;
}

class Checkbox extends Component<IProps> {

  public render() {
    const { handleChange, checked, name } = this.props;
    return (
      <CheckboxLabelContainer>
        <HiddenCheckboxInput name={name} onChange={handleChange} checked={checked} {...this.props} />
        <StyledCheckbox checked={checked}>
          <Checkmark />
        </StyledCheckbox>
      </CheckboxLabelContainer>
    );
  }
}

export { Checkbox };
