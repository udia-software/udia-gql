import toH from "hast-to-hyperscript";
import { createElement } from "react";
import { Attacher } from "unified";
import { Node } from "unist";
import visit from "unist-util-visit-parents";
import { Element } from "../../components/composite/ast/element";

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
    return toH(h, preNodeCompile(node), prefix);
  }

  const h = (name: string, props: any, children: any) => {
    const component = components.hasOwnProperty(name) ? components[name] : name;
    if (props && props.position && props.key) {
      const { key, position } = props;
      const hElement = createElement(
        component,
        { ...props, key: undefined, position: undefined },
        children
      );
      return createElement(Element, { key, position }, hElement);
    } else {
      return createElement(component, props, children);
    }
  };

  const preNodeCompile = (node: Node) => {
    visit(node, "element", visitor);
    return node;
  };

  const visitor = (node: Node) => {
    if (node.position) {
      node.properties = { ...node.properties, position: node.position };
    }
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
  };

  const appendStyle = (node: Node, property: string, value: string) => {
    let prevStyle = ((node.properties as any).style || "").trim();
    if (prevStyle && !/;\s*/.test(prevStyle)) {
      prevStyle += ";";
    }
    if (prevStyle) {
      prevStyle += " ";
    }
    const nextStyle = prevStyle + property + ": " + value + ";";
    (node.properties as any).style = nextStyle;
  };
};

export default rehype2React;
