import React, { ElementType, Fragment, ReactElement, ReactNode } from "react";
import { Node } from "unist";

interface IAstToReactOptions {
  renderers: { [nodeType: string]: any };
  sourcePos?: boolean;
  className?: string;
  linkTarget?: (url?: string, children?: ReactNode, title?: string) => string | string;
  transformLinkUri?: (url?: string, children?: ReactNode, title?: string) => string | string;
  transformImageUri?: (url?: string, children?: ReactNode, title?: string, alt?: string) => string | string;
  escapeHtml?: boolean;
  skipHtml?: boolean;
}

export interface IAstNodeProps {
  key: string;
  className?: string;
  nodeKey?: string;
  children?: ReactNode;
  level?: number;
  start?: number | string;
  ordered?: string;
  tight?: string;
  depth?: number;
  checked?: boolean;
  index?: number;
  identifier?: any;
  title?: string;
  url?: string;
  language?: string;
  inline?: string;
  target?: string;
  href?: string;
  alt?: string;
  src?: string;
  columnAlignment?: string;
  isHeader?: boolean;
  align?: string;
  tag?: string;
  isBlock?: boolean;
  escapeHtml?: boolean;
  skipHtml?: boolean;
  element?: ReactNode;
  type?: string;
  position?: string | number;
  value?: any;
  definitions?: any;
}

interface INodeParent {
  node?: Node;
  props?: IAstNodeProps;
}

interface INodeDefinitions { [identifier: string]: { href?: string, title?: string }; }

export function astToReact(node: Node, options: IAstToReactOptions, parent: INodeParent = {}, index = 0): ReactElement {
  const renderer = options.renderers[node.type];

  const pos = node.position!.start;
  const key = [node.type, pos.line, pos.column].join("-");

  if (
    typeof renderer !== "function" &&
    typeof renderer !== "string" &&
    !isReactFragment(renderer)
  ) {
    throw new Error(`Renderer for type \`${node.type}\` not defined or is not renderable`);
  }

  const nodeProps = getNodeProps(node, key, options, renderer, parent, index);

  const resolveChildren = () => (
    node.children &&
    (node.children as Node[]).map((childNode, i) =>
      astToReact(childNode, options, { node, props: nodeProps }, i)
    )
  );

  return React.createElement(
    renderer,
    nodeProps,
    nodeProps.children || resolveChildren() || undefined
  );
}

export function getDefinitions(node: Node, defs: INodeDefinitions = {}): INodeDefinitions {
  return (node.children as Node[] || []).reduce((definitions, child) => {
    if (child.type === "definition") {
      definitions[(child.identifier as string)] = {
        href: child.url as string,
        title: child.title as string
      };
    }

    return getDefinitions(child, definitions);
  }, defs);
}

const isReactFragment = (renderer: ElementType) => {
  return Fragment && Fragment === renderer;
};

const getNodeProps = (
  node: Node,
  key: string,
  opts: IAstToReactOptions,
  renderer: ElementType,
  parent: INodeParent = {},
  index = 0
): IAstNodeProps => {
  let props: IAstNodeProps = { key };

  const isTagRenderer = typeof renderer === "string";

  const ref =
    node.identifier !== null && node.identifier !== undefined
      ? {}
      : null;

  switch (node.type) {
    case "root":
      props = { ...props, className: opts.className };
      break;
    case "text":
      props.nodeKey = key;
      props.children = node.value as ReactNode;
      break;
    case "heading":
      props.level = node.depth as number;
      break;
    case "list":
      props.start = node.start as number;
      props.ordered = (!!node.ordered).toString();
      props.tight = (!node.loose).toString();
      props.depth = node.depth as number;
      break;
    case "listItem":
      props.checked = node.checked as boolean;
      props.ordered = (!!node.ordered).toString();
      props.tight = (!node.loose).toString();
      props.index = node.index as number;
      props.children = getListItemChildren(node, parent).map((childNode, i) => {
        return astToReact(childNode, opts, { node, props }, i);
      });
      break;
    case "definition":
      props = {
        ...props,
        identifier: node.identifier,
        title: node.title as string,
        url: node.url as string
      };
      break;
    case "code":
      props = {
        ...props,
        language: node.lang && (node.lang as string).split(/\s/, 1)[0]
      };
      break;
    case "inlineCode":
      props.children = node.value as ReactNode;
      props.inline = "true";
      break;
    case "link":
      props = {
        ...props,
        title: node.title as string || undefined,
        target:
          typeof opts.linkTarget === "function"
            ? opts.linkTarget(node.url as string, node.children as ReactNode, node.title as string)
            : opts.linkTarget,
        href: opts.transformLinkUri
          ? opts.transformLinkUri(node.url as string, node.children as ReactNode, node.title as string)
          : node.url as string
      };
      break;
    case "image":
      props = {
        ...props,
        alt: node.alt as string || undefined,
        title: node.title as string || undefined,
        src: opts.transformImageUri
          ? opts.transformImageUri(
            node.url as string,
            node.children as ReactNode,
            node.title as string,
            node.alt as string
          ) : node.url as string
      };
      break;
    case "linkReference":
      props = {
        ...props,
        ...ref,
        href: opts.transformLinkUri ? opts.transformLinkUri((ref as any).href) : (ref as any).href as string
      };
      break;
    case "imageReference":
      props = {
        ...props,
        src:
          opts.transformImageUri && (ref as any).href
            ? opts.transformImageUri(
              (ref as any).href, node.children as ReactNode, (ref as any).title, node.alt as string)
            : (ref as any).href,
        title: (ref as any).title || undefined,
        alt: node.alt as string || undefined
      };
      break;
    case "table":
    case "tableHead":
    case "tableBody":
      props.columnAlignment = node.align as string;
      break;
    case "tableRow":
      props.isHeader = parent.node!.type === "tableHead";
      props.columnAlignment = parent.props!.columnAlignment;
      break;
    case "tableCell":
      props = {
        ...props,
        isHeader: parent.props!.isHeader,
        align: parent.props!.columnAlignment![index]
      };
      break;
    case "virtualHtml":
      props.tag = node.tag as string;
      break;
    case "html":
      // @todo find a better way than this
      props.isBlock = node.position!.start.line !== node.position!.end.line;
      props.escapeHtml = opts.escapeHtml;
      props.skipHtml = opts.skipHtml;
      break;
    case "parsedHtml": {
      let parsedChildren;
      if (node.children) {
        parsedChildren = (node.children as Node[]).map((child, i) => astToReact(child, opts, { node, props }, i));
      }
      props.escapeHtml = opts.escapeHtml;
      props.skipHtml = opts.skipHtml;
      props.element = mergeNodeChildren(node, parsedChildren);
      break;
    }
    default:
      props = {
        ...props,
        ...node,
        type: undefined,
        position: undefined,
        children: undefined
      };
  }

  if (!isTagRenderer && node.value) {
    props.value = node.value;
  }

  return props;
};

function mergeNodeChildren(node: Node, parsedChildren: ReactNode) {
  const el = node.element as ReactNode;
  if (Array.isArray(el)) {
    return React.createElement(Fragment, null, el);
  }

  if ((el as any).props.children || parsedChildren) {
    const children = React.Children.toArray((el as any).props.children).concat(parsedChildren);
    return React.cloneElement(el as any, undefined, children);
  }
  return React.cloneElement(el as any, undefined);
}

function getListItemChildren(node: Node, parent: INodeParent): Node[] {
  if (node.loose) {
    return node.children as Node[];
  }

  if (
    parent.node &&
    node.index as number > 0 &&
    (parent.node.children as Node[])[node.index as number - 1].loose
  ) {
    return node.children as Node[];
  }

  return unwrapParagraphs(node);
}

function unwrapParagraphs(node: Node) {
  return (node.children as Node[]).reduce<Node[]>((array, child) => {
    return array.concat(
      child.type === "paragraph" ? child.children as Node[] || [] : [child]
    );
  }, []);
}
