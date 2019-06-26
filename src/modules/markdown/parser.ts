import { createElement, ReactNode } from "react";
import RemarkMathPlugin from "remark-math";
import RemarkParsePlugin from "remark-parse";
import RemarkRehypePlugin from "remark-rehype";
import unified, { Processor } from "unified";
import { Node } from "unist";
import { TeX } from "../../components/composite/tex";
import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Pre
} from "../../components/static/themedHelpers";
import RehypeReactPlugin from "./rehypeReact";

export class MarkdownParser {
  public parser: Processor;

  constructor() {
    this.parser = unified()
      .use(RemarkParsePlugin)
      .use(RemarkMathPlugin)
      .use(RemarkRehypePlugin, {
        commonmark: true,
        handlers: {
          math: (h: any, node: Node) => ({
            ...h(node),
            tagName: "tex",
            properties: { block: true }
          }),
          inlineMath: (h: any, node: Node) => ({
            ...h(node),
            tagName: "tex",
            properties: { block: false }
          })
        }
      })
      .use(RehypeReactPlugin, {
        createElement: (component: any, props: any, children: ReactNode) => {
          // console.log(component, props, children);
          return createElement(component, props, children);
        },
        components: {
          tex: TeX,
          h1: H1,
          h2: H2,
          h3: H3,
          h4: H4,
          h5: H5,
          h6: H6,
          pre: Pre
        }
      });
  }

  public parse(value: string) {
    return this.parser.parse(value);
  }

  public render(value: string) {
    return this.parser.processSync(value).contents;
  }

  public nodeToRange({ position }: Node) {
    if (position) {
      return [position.start.offset!, position.end.offset!];
    }
  }

  public *forEachProperty(node: Node) {
    for (const prop in node) {
      if (node.hasOwnProperty(prop)) {
        yield {
          value: node[prop],
          key: prop
        };
      }
    }
  }
}
