import katex, { KatexOptions } from "katex";
import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import styled, { IThemeInterface } from "../static/appStyles";

interface IProps {
  value?: string;
  block?: boolean;
  children?: string[];
}

const KatexBlock = styled.div`
.katex-display > .katex {
  overflow-x: visible;
  overflow-y: hidden;
  scrollbar-color: ${({ theme }) => theme.purple + " " + theme.green};
  scrollbar-width: thin;
}`;

export const TeX = (props: IProps) => {
  const Component = props.block ? KatexBlock : "span";
  const math = props.children && props.children[0] || props.value || "";
  const katexOptions: KatexOptions = {
    throwOnError: false,
    errorColor: (useContext(ThemeContext) as IThemeInterface).red,
    displayMode: !!props.block
  };

  return (
    <Component
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(math, katexOptions)
      }}
    />
  );
};
