declare module "remark-math" {
  import { Plugin } from "unified";
  export interface MathPluginOpts {
    inlineMathDouble?: boolean;
  }
  const mathPlugin: Plugin;
  export default mathPlugin;
}
