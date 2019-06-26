import { Node } from "unist";
import { MarkdownParser } from "../../../modules/markdown/parser";

function isInRange(range: number[], pos: number) {
  return pos >= range[0] && pos <= range[1];
}

function nodeToRange(parser: MarkdownParser, node: Node | Node[]) {
  if (Array.isArray(node)) {
    if (node.length > 0) {
      // check first and last child
      const rangeFirst = node[0] && parser.nodeToRange(node[0]);
      const rangeLast =
        node[node.length - 1] && parser.nodeToRange(node[node.length - 1]);
      if (rangeFirst && rangeLast) {
        return [rangeFirst[0], rangeLast[1]];
      }
    }
  } else {
    const range = parser.nodeToRange(node);
    if (range) {
      return range;
    }
  }
}

export function getFocusPath(
  node: Node | any,
  pos: number = -1,
  parser: MarkdownParser,
  seen = new Set()
): Node[] {
  seen.add(node);

  const path = [];
  const range = nodeToRange(parser, node);
  if (range) {
    if (isInRange(range, pos)) {
      path.push(node);
    } else {
      return [];
    }
  }
  for (const { value } of parser.forEachProperty(node)) {
    if (typeof value === "object" && value && !seen.has(value)) {
      let childPath = getFocusPath(value, pos, parser, seen);
      if (childPath.length > 0) {
        childPath = range ? childPath : [node].concat(childPath);
        path.push(...childPath);
        break;
      }
    }
  }
  return path;
}
