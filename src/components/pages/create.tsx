import ApolloClient from "apollo-client";
import React, { ChangeEventHandler, Component, MouseEventHandler, RefObject, SyntheticEvent } from "react";
import { withApollo } from "react-apollo";
import { Helmet } from "react-helmet-async";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { STUB } from "../../constants";
import { ISetCursorAction, setCursor } from "../../modules/configureReduxStore";
import { ASTOutput } from "../composite/ast/astOutput";
import { LoadingOverlay } from "../composite/loadingOverlay";
import styled from "../static/appStyles";
import { Checkbox } from "../static/checkbox";
import { FormField, FormLabel, FormLabelContent, SubmitButton } from "../static/formHelpers";

const CreateContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  align-content: stretch;
  width: 100%;
  max-width: 100%;
`;

const PreviewContainer = styled.div`
  height: 100%;
  width: 100%;
  max-width: 100%;
  align-self: flex-start;
  border-color: ${({ theme }) => theme.purple};
  border-width: 1px;
  border-style: dashed;
  box-sizing: border-box;
  padding: 0 0.2em;
`;

const EditorContainer = styled.form`
  display: grid;
  grid-template-areas: "resizer" "editor";
  grid-template-rows: auto 1fr;
  width: 100%
  max-width: 100%;
  min-width: 100%;
  position: sticky;
  align-self: flex-end;
  bottom: 0;
`;

const ResizeBar = styled.div`
  grid-area: resizer;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  cursor: row-resize;
  background-color: ${({ theme }) => theme.purple};
  box-sizing: border-box;
  border-color: ${({ theme }) => theme.purple};
  border-width: 1px;
  border-style: dashed;
`;

const TextArea = styled.textarea`
  grid-area: editor;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  min-height: 10em;
  height: 100%;
  box-sizing: border-box;
  color: ${({ theme }) => theme.primaryColor};
  background-color: ${({ theme }) => theme.backgroundColor};
  resize: vertical;
`;

interface IProps {
  client: ApolloClient<{}>;
  cursorAt: (cursor: number | null) => ISetCursorAction;
}

interface IState {
  content: string;
  resizing: boolean;
  lastResizePosition: number | null;
  isLoading: boolean;
  submitButtonText: string;
  showFormErrors?: string;
  submitEncrypted: boolean;
  loadingText: string;
}

const BUTTON_TEXT = {
  private: "Submit Private, Encrypted",
  public: "Submit Public, Signed",
  loading: "Loading..."
};

class EditorController extends Component<IProps, IState> {
  private textAreaRef: RefObject<HTMLTextAreaElement>;
  private editorRef: RefObject<HTMLFormElement>;
  constructor(props: IProps) {
    super(props);
    this.state = {
      content: STUB,
      resizing: false,
      lastResizePosition: null,
      isLoading: false,
      submitButtonText: BUTTON_TEXT.public,
      submitEncrypted: false,
      loadingText: ""
    };
    this.textAreaRef = React.createRef();
    this.editorRef = React.createRef();
  }

  public componentDidMount() {
    if (this.textAreaRef.current) {
      this.textAreaRef.current.focus();
    }
  }

  public render() {
    const { content, isLoading, submitButtonText, showFormErrors, submitEncrypted, loadingText } = this.state;
    return (
      <CreateContainer>
        <Helmet>
          <title>Create - UDIA</title>
          <meta name="description" content="Create new content, User." />
        </Helmet>
        <PreviewContainer>
          <ASTOutput source={content} />
        </PreviewContainer>

        <FormField>
          <FormLabel style={{ cursor: "pointer" }}>
            <FormLabelContent>
              Encrypt Content
              <Checkbox
                name="encrypted"
                handleChange={this.handleInputChange}
                checked={submitEncrypted}
              />
            </FormLabelContent>
          </FormLabel>
        </FormField>
        <SubmitButton
          type="button"
          disabled={isLoading || !!showFormErrors}
          children={submitButtonText}
          onClick={this.handleSubmit}
        />
        <EditorContainer ref={this.editorRef}>
          <ResizeBar
            children={"todo resizer"} />
          <LoadingOverlay
            gridArea={"editor"}
            isLoading={isLoading}
            loadingText={loadingText}
          />
          <TextArea
            value={content}
            onChange={this.handleChange}
            onSelect={this.handleSelect}
            ref={this.textAreaRef}
          />
        </EditorContainer>
      </CreateContainer>
    );
  }

  protected handleInputChange: ChangeEventHandler<HTMLInputElement> = e => {
    const checkDiff = { [e.currentTarget.name]: e.currentTarget.checked };
    if ("encrypted" in checkDiff) {
      this.setState(() => ({
        submitEncrypted: checkDiff.encrypted,
        submitButtonText: checkDiff.encrypted ? BUTTON_TEXT.private : BUTTON_TEXT.public
      }));
    }
  }

  protected handleChange: ChangeEventHandler<HTMLTextAreaElement> = e => {
    const content = e.currentTarget.value;
    this.setState(() => ({ content }));
  };

  protected handleSelect = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    if (e.currentTarget) {
      const { selectionStart } = e.currentTarget;
      this.props.cursorAt(selectionStart);
    }
  };

  protected handleSubmit: MouseEventHandler<HTMLButtonElement> = e => {
    e.preventDefault();
    this.setState(() => ({
      isLoading: true,
      submitButtonText: BUTTON_TEXT.loading
    }));

    const { submitEncrypted } = this.state;
    try {
      // todo submit gql method call
    } catch (err) {
      console.error(err);
    } finally {
      this.setState(() => ({
        isLoading: false,
        submitButtonText: submitEncrypted ? BUTTON_TEXT.private : BUTTON_TEXT.public
      }));
    }
  }

  protected handleResizeStart: MouseEventHandler<HTMLDivElement> = e => {
    const { clientY } = e;
    console.log("resizeStart", clientY);
    this.setState(() => ({
      resizing: true,
      lastResizePosition: clientY
    }));
  }

  protected handleResizeMove: MouseEventHandler<HTMLDivElement> = e => {
    const { resizing, lastResizePosition } = this.state;
    const { clientY } = e;
    console.log("resizeMove", clientY);
    if (resizing && this.editorRef.current && lastResizePosition !== null) {

      const heightDelta = lastResizePosition - clientY;
      const editorHeight = this.editorRef.current.clientHeight;
      console.log(lastResizePosition, clientY, heightDelta, editorHeight);
      if (heightDelta !== 0) {
        // apply height difference
        this.editorRef.current.style.height = `${editorHeight + heightDelta}px`;
        this.setState(() => ({ lastResizePosition: clientY }));
      }
    }
  }

  protected handleResizeEnd: MouseEventHandler<HTMLDivElement> = e => {
    console.log("resizeEnd", e.clientY);
    this.setState(() => ({
      resizing: false,
      lastResizePosition: null
    }));
  }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  cursorAt: (cursor: number | null) => dispatch(setCursor(cursor))
});
export const Create = connect(
  mapStateToProps,
  mapDispatchToProps
)(withApollo(EditorController));
