declare module "hast-to-hyperscript" {
  import { Node } from "unist";
  type creator = (name: string, props: any, children: any) => any;

  function toH(h: creator, n: Node, p: string): string;
  export default toH;
}
