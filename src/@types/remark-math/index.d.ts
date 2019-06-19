declare module "remark-math" {
  interface MathPluginOpts {
    inlineMathDouble?: boolean;
  }
  export function mathPlugin(opts: MathPluginOpts | null): void;
}
