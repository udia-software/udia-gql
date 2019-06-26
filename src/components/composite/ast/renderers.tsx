import React, { createElement } from "react";
import { IAstNodeProps } from "./astToReact";

export default {
  break: "br",
  paragraph: "p",
  emphasis: "em",
  strong: "strong",
  thematicBreak: "hr",
  blockquote: "blockquote",
  delete: "del",
  link: "a",
  image: "img",
  linkReference: "a",
  imageReference: "img",
  table: SimpleRenderer.bind(null, "table"),
  tableHead: SimpleRenderer.bind(null, "thead"),
  tableBody: SimpleRenderer.bind(null, "tbody"),
  tableRow: SimpleRenderer.bind(null, "tr"),
  tableCell: TableCell,

  root: Root,
  text: TextRenderer,
  list: List,
  listItem: ListItem,
  definition: NullRenderer,
  heading: Heading,
  inlineCode: InlineCode,
  code: CodeBlock,
  html: Html,
  virtualHtml: VirtualHtml,
  parsedHtml: ParsedHtml
};

function TextRenderer(props: IAstNodeProps) {
  return props.children;
}

function Root(props: IAstNodeProps) {
  const useFragment = !props.className;
  const root = useFragment ? React.Fragment || "div" : "div";
  return createElement(root, useFragment ? null : props, props.children);
}

function SimpleRenderer(tag: string, props: IAstNodeProps) {
  return createElement(tag, props, props.children);
}

function TableCell(props: IAstNodeProps) {
  const style = props.align ? {textAlign: props.align} : undefined;
  return createElement(
    props.isHeader ? "th" : "td",
    style ? {...style, ...props} : props,
    props.children
  );
}

function Heading(props: IAstNodeProps) {
  return createElement(`h${props.level}`, props, props.children);
}

function List(props: IAstNodeProps) {
  const attrs = props;
  if (props.start && props.start !== 1) {
    attrs.start = props.start.toString();
  }

  return createElement(props.ordered ? "ol" : "ul", attrs, props.children);
}

function ListItem(props: IAstNodeProps) {
  let checkbox = null;
  if (props.checked !== null) {
    const checked = props.checked;
    checkbox = createElement("input", {type: "checkbox", checked, readOnly: true});
  }

  return createElement("li", props, checkbox, props.children);
}

function CodeBlock(props: IAstNodeProps) {
  const className = props.language && `language-${props.language}`;
  const code = createElement("code", className ? {className} : null, props.value);
  return createElement("pre", props, code);
}

function InlineCode(props: IAstNodeProps) {
  return createElement("code", props, props.children);
}

function Html(props: IAstNodeProps) {
  if (props.skipHtml) {
    return null;
  }

  const tag = props.isBlock ? "div" : "span";
  if (props.escapeHtml) {
    const comp = React.Fragment || tag;
    return createElement(comp, null, props.value);
  }

  const nodeProps = {dangerouslySetInnerHTML: {__html: props.value}};
  return createElement(tag, nodeProps);
}

function ParsedHtml(props: IAstNodeProps) {
  return props.element;
}

function VirtualHtml(props: IAstNodeProps) {
  return createElement(props.tag!, props, props.children);
}

function NullRenderer() {
  return null;
}
