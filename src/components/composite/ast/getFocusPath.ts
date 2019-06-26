function isInRange(range: number[], pos: number) {
  return pos >= range[0] && pos <= range[1];
}

export function nodeToRange(parser: any, node: any) {
  const range = parser.nodeToRange(node);
  if (range) {
    return range;
  }
  if (node.length > 0) {
    // check first and last child
    const rangeFirst = node[0] && parser.nodeToRange(node[0]);
    const rangeLast = node[node.length - 1] &&
      parser.nodeToRange(node[node.length - 1]);
    if (rangeFirst && rangeLast) {
      return [rangeFirst[0], rangeLast[1]];
    }
  }
}

export function getFocusPath(
  node: any,
  pos: number = -1,
  parser: any,
  seen = new Set()
  ): any {
  seen.add(node);

  let path = [];
  const range = nodeToRange(parser, node);
  if (range) {
    if (isInRange(range, pos)) {
      path.push(node);
    } else {
      return [];
    }
  }
  for (const { value } of parser.forEachProperty(node)) {
    if (value && typeof value === "object" && !seen.has(value)) {
      const childPath = getFocusPath(value, pos, parser, seen);
      if (childPath.length > 0) {
        path = path.concat(childPath);
        break;
      }
    }
  }
  return path;
}
