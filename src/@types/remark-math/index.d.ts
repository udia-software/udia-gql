declare module "remark-math" {
  import { Plugin } from "unified";
  export interface MathPluginOpts {
    inlineMathDouble?: boolean;
  }
  const remarkMathPlugin: Plugin;
  export default remarkMathPlugin;
}
