declare module "unist-util-visit-parents" {
  import { Node } from "unist";
  function visit(n: Node, test: string, visitor: Function): void;
  export default visit;
}
