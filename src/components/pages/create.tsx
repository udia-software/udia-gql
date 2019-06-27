import React, {
  ChangeEventHandler,
  Component,
  RefObject,
  SyntheticEvent
} from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { STUB } from "../../constants";
import { ISetCursorAction, setCursor } from "../../modules/configureReduxStore";
import { ASTOutput } from "../composite/ast/astOutput";
import styled from "../static/appStyles";

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

const TextArea = styled.textarea`
  min-width: 100%;
  width: 100%;
  max-width: 100%;
  height: 20em;
  box-sizing: border-box;
  position: sticky;
  bottom: 0;
  align-self: flex-end;
`;

interface IProps {
  cursorAt: (cursor: number | null) => ISetCursorAction;
}

interface IState {
  content: string;
}

class EditorController extends Component<IProps, IState> {
  private textAreaRef: RefObject<HTMLTextAreaElement>;
  constructor(props: IProps) {
    super(props);
    this.state = {
      content: STUB
    };
    this.textAreaRef = React.createRef();
  }

  public render() {
    const { content } = this.state;
    return (
      <CreateContainer>
        <PreviewContainer>
          <ASTOutput source={content} />
        </PreviewContainer>
        <TextArea
          value={content}
          onChange={this.handleChange}
          // onScroll={this.handleScroll}
          onSelect={this.handleSelect}
          ref={this.textAreaRef}
        />
      </CreateContainer>
    );
  }

  protected handleChange: ChangeEventHandler<HTMLTextAreaElement> = e => {
    const content = e.target.value;
    this.setState(() => ({ content }));
  };

  // protected handleScroll: UIEventHandler<HTMLTextAreaElement> = e => {
  //   if (e.currentTarget) {
  //     window.scrollTo({
  //       top: e.currentTarget.scrollTop,
  //       behavior: "auto"
  //     });
  //     const { selectionStart } = e.currentTarget;
  //     this.props.cursorAt(selectionStart);
  //   } else {
  //     // tslint:disable-next-line:no-console
  //     console.error("missing target/ref");
  //   }
  // };

  protected handleSelect = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    if (e.currentTarget) {
      const { selectionStart } = e.currentTarget;
      this.props.cursorAt(selectionStart);
    }
  };
}

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  cursorAt: (cursor: number | null) => dispatch(setCursor(cursor))
});
export const Create = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditorController);
