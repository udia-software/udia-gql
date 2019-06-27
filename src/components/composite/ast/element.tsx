import React, {
  Fragment,
  Key,
  ReactNode,
  useEffect,
  useMemo,
  useRef
} from "react";
import { connect } from "react-redux";
import { Position } from "unist";
import { IRootState } from "../../../modules/configureReduxStore";
import styled from "../../static/appStyles";

interface IProps {
  key: Key;
  cursor?: number;
  position?: Position;
  children?: ReactNode;
}

const Indicator = styled.span`
  position: absolute;
  right: 0;
  color: ${({ theme }) => theme.purple};
  animation: ${({ theme }) => theme.pulse} 1s linear infinite;
`;

const ElementIndicator = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const scrollToIndicator = () => {
    if (ref.current) {
      const refTop = ref.current.offsetTop;
      const scrollToVal = Math.max(refTop - window.innerHeight / 3, 0);
      window.scrollTo({
        top: scrollToVal,
        behavior: "smooth"
      });
    }
  };
  const memoizedScroll = useMemo(() => scrollToIndicator, [!!ref.current]);
  useEffect(() => memoizedScroll(), [!!ref.current]);
  return <Indicator ref={ref}>&lt;</Indicator>;
};

const TreeElement = (props: IProps) => {
  const { cursor, position } = props;

  const activateCursor =
    !!position &&
    !!cursor &&
    !!position.start.offset &&
    !!position.end.offset &&
    position.start.offset <= cursor &&
    cursor <= position.end.offset;

  return (
    <Fragment key={props.key}>
      {activateCursor && <ElementIndicator/>}
      {props.children}
    </Fragment>
  );
};

const mapStateToProps = (state: IRootState) => ({
  cursor: state.editor.cursor
});

export const Element = connect(mapStateToProps)(TreeElement);
