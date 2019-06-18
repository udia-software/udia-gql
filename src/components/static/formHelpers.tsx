import styled from "./appStyles";
import { IWithGridArea } from "./themedHelpers";

export const Form = styled.form<IWithGridArea>(({ gridArea }) => ({
  paddingBottom: "1em",
  gridArea,
  width: "min-content"
}));

export const FormFieldset = styled.fieldset`
  text-align: left;
`;

export const FormLegend = styled.legend`
  background-color: ${({ theme }) => theme.backgroundColor};
`;

export const FormField = styled.span`
  display: block;
  padding-bottom: 0.4em;
`;

export const FormLabel = styled.label`
  display: block;
`;

export const FormLabelContent = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const FormInput = styled.input`
  padding: 0.3em;
  font-size: medium;
  background: ${({ theme }) => theme.inputBaseBackgroundColor};
  border: 1px solid ${({ theme }) => theme.inverseColor};
  color: #000000;
  border-radius: 3px;
  :focus {
    border: 1px solid ${({ theme }) => theme.purple};
  }
`;

export const FormOutput = styled.output`
  display: block;
  word-wrap: break-word;
`;

export const SubmitButton = styled.button`
  background: ${({ theme }) => theme.backgroundColor};
  color: ${({ theme }) => theme.primaryColor};
  border-color: ${({ theme }) => theme.primaryColor};
  border-radius: 0.5em;
  width: 100%;
  cursor: pointer;
  :hover:enabled {
    border-color: ${({ theme }) => theme.purple};
    color: ${({ theme }) => theme.backgroundColor};
    background: ${({ theme }) => theme.primaryColor};
  }
  :disabled {
    border-color: ${({ theme }) => theme.red};
    color: ${({ theme }) => theme.red};
    cursor: not-allowed;
  }
`;

export const UnstyledList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  border-style: none dashed dashed dashed;
  border-color: ${({ theme }) => theme.purple};
  border-width: 1px;
`;

export const CenteredListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.2em;
`;
