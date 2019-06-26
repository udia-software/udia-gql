import katex, { KatexOptions } from "katex";
import React, { useContext, useMemo } from "react";
import RemarkMathPlugin from "remark-math";
import RemarkParsePlugin from "remark-parse";
import { ThemeContext } from "styled-components";
import unified from "unified";
import { IThemeInterface } from "../../static/appStyles";
import { H1, H2, H3, H4, H5, H6, KatexBlock, Pre } from "../../static/themedHelpers";
import { astToReact, getDefinitions, IAstNodeProps } from "./astToReact";
import { getFocusPath } from "./getFocusPath";
import renderers from "./renderers";

interface IProps {
  source: string;
  cursor?: number;
}

export const ASTOutput = ({ source, cursor }: IProps) => {
  const parser = unified();

  (parser as any).nodeToRange = ({ position }: any) => {
    if (position) {
      return [position.start.offset, position.end.offset];
    }
  };

  (parser as any)._ignoredProperties = new Set();

  (parser as any).forEachProperty = function*(node: any) {
    for (const prop in node) {
      if (this._ignoredProperties.has(prop)) {
        continue;
      }
      yield {
        value: node[prop],
        key: prop,
        computed: false,
      };
    }
},

  parser.use(RemarkParsePlugin, {});
  parser.use(RemarkMathPlugin, {});

  const katexOptions: KatexOptions = {
    throwOnError: false,
    errorColor: (useContext(ThemeContext) as IThemeInterface).red,
    displayMode: false,
  };

  const math = ({ value }: { value: string }) => (
    <KatexBlock
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(value, { ...katexOptions, displayMode: true })
      }}
    />
  );

  const inlineMath = ({ value }: { value: string }) => (
    <span
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(value, katexOptions)
      }}
    />
  );

  const heading = ({ level, children }: IAstNodeProps) => {
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
  };

  const code = ({ language, value }: IAstNodeProps) => (
    <Pre><code className={`lang-${language}`}>{value}</code></Pre>
  );

  const ast = parser.parse(source);
  const output = useMemo(() => {
    const renderProps = {
      renderers: { ...renderers, math, inlineMath, heading, code },
      definitions: getDefinitions(ast)
    };
    return astToReact(ast, renderProps);
  }, [ast, cursor]);

  const focusPath = useMemo(() => ast && cursor !== null ?
    getFocusPath(ast, cursor, parser) : [],
    [ast, cursor, parser]
  );

  // tslint:disable-next-line: no-console
  console.log(focusPath);

  return output;
};
