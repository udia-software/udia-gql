import React, { Fragment, useMemo } from "react";
import { MarkdownParser } from "../../../modules/markdown/parser";
import { getFocusPath } from "./getFocusPath";

interface IProps {
  source: string;
  cursor?: number;
}

export const ASTOutput = ({ source, cursor }: IProps) => {
  const parser = new MarkdownParser();

  const { output } = useMemo(() => {
    const ast = parser.parse(source);
    const focus = ast && cursor ? getFocusPath(ast, cursor, parser) : [];
    // tslint:disable-next-line: no-console
    console.log(focus);
    return {
      output: parser.render(source),
      focusPath: focus
    };
  }, [source, cursor]);

  return <Fragment>{output}</Fragment>;
};
