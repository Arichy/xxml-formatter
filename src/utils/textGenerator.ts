import { Node } from '../types';
import { BR } from '../const';

const blanckspaceCache = new Map<number, string>();
export function generateBlankSpace(indent: number) {
  const _result = blanckspaceCache.get(indent);
  if (_result) {
    return _result;
  }

  let result = '';

  for (let i = 0; i < indent; i++) {
    result += ' ';
  }

  blanckspaceCache.set(indent, result);

  return result;
}

export function generateAttrsText(node: Node, breakAttrs: boolean, tabSize: number) {
  const { attrs, indent } = node;

  if (breakAttrs) {
    const indentBlankSpace = generateBlankSpace(indent);
    const tabSizeBlankSpace = generateBlankSpace(tabSize);

    return Object.entries(attrs).reduce((result, [key, value]) => {
      return `${result}${BR}${indentBlankSpace}${tabSizeBlankSpace}${key}="${value}"`;
    }, '');
  } else {
    return Object.entries(attrs).reduce((result, [key, value]) => {
      return `${result} ${key}="${value}"`;
    }, '');
  }
}
