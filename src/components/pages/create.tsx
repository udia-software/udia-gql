import ApolloClient from "apollo-client";
import gql from "graphql-tag";
import React, { ChangeEventHandler, Component, ContextType, MouseEventHandler, RefObject, SyntheticEvent } from "react";
import { withApollo } from "react-apollo";
import { Helmet } from "react-helmet-async";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { STUB } from "../../constants";
import { ICreateItemInput } from "../../graphql/schema";
import { ISetCursorAction, setCursor } from "../../modules/configureReduxStore";
import Crypt, { IEncryptKeyPair, ISignKeyPair } from "../../modules/crypt";
import { LocalForageContext } from "../../modules/localForageContext";
import { ASTOutput } from "../composite/ast/astOutput";
import { LoadingOverlay } from "../composite/loadingOverlay";
import styled from "../static/appStyles";
import { Checkbox } from "../static/checkbox";
import { FormField, FormLabel, FormLabelContent, FormOutput, SubmitButton } from "../static/formHelpers";

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
  submitEncrypted: boolean;
  loadingText: string;
  hasError: boolean;
  errorMessage: string;
}

const BUTTON_TEXT = {
  private: "Submit Private, Encrypted",
  public: "Submit Public, Signed",
  loading: "Loading..."
};

class EditorController extends Component<IProps, IState> {
  public static contextType = LocalForageContext;
  public context!: ContextType<typeof LocalForageContext>;

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
      loadingText: "",
      hasError: false,
      errorMessage: ""
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
    const { content, isLoading, submitButtonText, submitEncrypted, loadingText, hasError, errorMessage } = this.state;
    return (
      <CreateContainer>
        <Helmet>
          <title>Create - UDIA</title>
          <meta name="description" content="Create new content, User." />
        </Helmet>
        <PreviewContainer>
          <ASTOutput source={content} />
        </PreviewContainer>
        {hasError && <FormOutput>{errorMessage}</FormOutput>}
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
          disabled={isLoading}
          children={submitButtonText}
          onClick={this.handleSubmit}
        />
        <EditorContainer ref={this.editorRef}>
          {false && <ResizeBar
            children={"todo resizer"} />}
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
    this.setState(() => ({ content, hasError: false }));
  };

  protected handleSelect = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    if (e.currentTarget) {
      const { selectionStart } = e.currentTarget;
      this.props.cursorAt(selectionStart);
    }
  };

  protected handleSubmit: MouseEventHandler<HTMLButtonElement> = async e => {
    e.preventDefault();
    const { client } = this.props;
    const { submitEncrypted, content } = this.state;

    this.setState(() => ({
      isLoading: true,
      submitButtonText: BUTTON_TEXT.loading,
      loadingText: "Fetching user cryptographic key pairs..."
    }));

    try {
      const signKeyPair = await this.context.getItem<ISignKeyPair>("signKeyPair");
      const encryptKeyPair = await this.context.getItem<IEncryptKeyPair>("encryptKeyPair");

      this.setState(() => ({
        loadingText: "Signing item content"
      }));
      const sig = Crypt.signMessage(content, signKeyPair);
      const data: ICreateItemInput = { content, sig };
      if (submitEncrypted) {
        this.setState(() => ({
          loadingText: "Encrypting item content"
        }));
        const encPayload = Crypt.asymmetricEncrypt(content, encryptKeyPair.publicKey, encryptKeyPair, signKeyPair);
        data.content = encPayload.cipherText;
        data.encryptionType = encPayload.type;
        data.version = encPayload.version;
        data.auth = encPayload.auth;
        data.iv = encPayload.iv;
      }

      this.setState(() => ({
        loadingText: "Sending request to server..."
      }));
      const createItemResponse = await client.mutate({
        mutation: gql`
          mutation CreateItem($data: CreateItemInput!) {
            createItem(data: $data) {
              uuid
              createdBy {
                uuid
                username
              }
              content
              parentId
              encryptionType
              version
              auth
              iv
              sig
              createdAt
            }
          }
        `,
        variables: { data },
        fetchPolicy: "no-cache"
      });
      const responseData = createItemResponse.data.createItem;
      console.log(responseData);
    } catch (err) {
      console.error(err);
      let errorMessage: string;
      if (err.graphQLErrors &&
        err.graphQLErrors[0] &&
        err.graphQLErrors[0].extensions &&
        err.graphQLErrors[0].extensions.exception &&
        err.graphQLErrors[0].extensions.exception[0]
      ) {
        const { message } = err.graphQLErrors[0].extensions.exception[0];
        errorMessage = message;
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = err.toString();
      }
      this.setState(() => ({
        hasError: true,
        errorMessage
      }));
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
