export type Attrs = {
  [attrName: string]: any;
};

export type Comment = {
  type: string;
  value: string;
};

export type Node = {
  name: string;
  attrs: Attrs;
  children: Array<Node | string | Comment>;
  indent: number;
};

export type Options = {
  tabSize: number;
  maxLength: number;
  selfClose: boolean;
};
