import katex, { KatexOptions } from "katex";
import React, { useContext } from "react";
import ReactMarkdown from "react-markdown";
import RemarkMathPlugin from "remark-math";
import { ThemeContext } from "styled-components";
import { IThemeInterface } from "../static/appStyles";
import { H1, H2, H3, H4, H5, H6, KatexBlock, Pre } from "../static/themedHelpers";

interface IProps {
  value: string;
}

export const MarkdownRenderer = (props: IProps) => {
  const katexOptions: KatexOptions = {
    throwOnError: false,
    errorColor: (useContext(ThemeContext) as IThemeInterface).red,
    displayMode: false,
  };

  return (
    <ReactMarkdown
      rawSourcePos={true}
      source={props.value}
      plugins={[RemarkMathPlugin]}
      renderers={{
        math: ({ value }: { value: string }) => (
          <KatexBlock
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(value, { ...katexOptions, displayMode: true })
            }}
          />
        ),
        inlineMath: ({ value }: { value: string }) => (
          <span
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(value, katexOptions)
            }}
          />
        ),
        heading: ({ level, children }) => {
          switch (level) {
            case 1:
              return <H1 children={children} />;
            case 2:
              return <H2 children={children} />;
            case 3:
              return <H3 children={children} />;
            case 4:
              return <H4 children={children} />;
            case 5:
              return <H5 children={children} />;
            case 6:
              return <H6 children={children} />;
            default:
              return <H1 children={children} />;
          }
        },
        code: ({
          language,
          value
        }: {
          language: string | null;
          value: string;
          children: any;
        }) => {
          return (
            <Pre>
              <code className={`lang-${language}`}>{value}</code>
            </Pre>
          );
        }
      }}
    />
  );
};
