import toH from "hast-to-hyperscript";
import { createElement } from "react";
import { Attacher } from "unified";
import { Node } from "unist";
import visit from "unist-util-visit-parents";

interface IRehypeReactOpts {
  preCompileNode?: (node: Node) => Node;
  components?: { [key: string]: any };
  prefix?: string;
}

const rehype2React: Attacher = function(options?: IRehypeReactOpts | unknown) {
  const { components = {}, prefix = "h" } = options as IRehypeReactOpts;

  this.Compiler = compiler;

  function compiler(node: Node) {
    if (node.type === "root") {
      if (
        node.children &&
        node.children instanceof Array &&
        node.children.length === 1 &&
        node.children[0].type === "element"
      ) {
        node = node.children[0];
      } else {
        node = {
          type: "element",
          tagName: "div",
          properties: node.properties || {},
          children: node.children
        };
      }
    }
    return toH(h, tableCellStyle(node), prefix);
  }

  function h(name: string, props: any, children: any) {
    const component = components.hasOwnProperty(name) ? components[name] : name;
    return createElement(component, props, children);
  }

  function tableCellStyle(node: Node) {
    visit(node, "element", visitor);
    return node;
  }

  function visitor(node: Node) {
    if (
      node.tagName !== "tr" &&
      node.tagName !== "td" &&
      node.tagName !== "th"
    ) {
      return;
    }

    const hastCssPropertyMap: { [key: string]: string } = {
      align: "text-align",
      valign: "vertical-align",
      height: "height",
      width: "width"
    };

    for (const hastName in hastCssPropertyMap) {
      if (
        !hastCssPropertyMap.hasOwnProperty(hastName) ||
        (node.properties as any)[hastName] === undefined
      ) {
        continue;
      }
      const cssName = hastCssPropertyMap[hastName];
      appendStyle(node, cssName, (node.properties as any)[hastName]);
      delete (node.properties as any)[hastName];
    }
  }

  function appendStyle(node: Node, property: string, value: string) {
    let prevStyle = ((node.properties as any).style || "").trim();
    if (prevStyle && !/;\s*/.test(prevStyle)) {
      prevStyle += ";";
    }
    if (prevStyle) {
      prevStyle += " ";
    }
    const nextStyle = prevStyle + property + ": " + value + ";";
    (node.properties as any).style = nextStyle;
  }
};

export default rehype2React;
