import React, { Fragment, useMemo } from "react";
import { MarkdownParser } from "../../../modules/markdown/parser";
// import { getFocusPath } from "./getFocusPath";

interface IProps {
  source: string;
  cursor?: number;
}

const parser = new MarkdownParser();
export const ASTOutput = ({ source }: IProps) => {
  const output = useMemo(() => parser.render(source), [source]);
  return <Fragment>{output}</Fragment>;
};
