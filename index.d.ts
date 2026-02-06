declare module '*.svg' {
  // biome-ignore lint/suspicious/noExplicitAny: SVG module typing uses any.
  const content: any;
  // biome-ignore lint/suspicious/noExplicitAny: SVG ReactComponent typing uses any.
  export const ReactComponent: any;
  export default content;
}
