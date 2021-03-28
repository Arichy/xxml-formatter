// @ts-ignore
import { Parser } from './htmlparser2';
import { Attrs, Node, Options } from './types';
import { generateBlankSpace, generateAttrsText } from './utils/textGenerator';
import { getOpentagLength } from './utils/getLength';
import { IGNORE_TAGS, BR } from './const';

const defaultOptions: Options = {
  tabSize: 2,
  maxLength: 80,
  selfClose: true,
};

type Stack = Node[] & {
  getLast?: () => Node | void;
};

export default class TTMLFormatter {
  opt: Options;
  private stack!: Stack;
  parser!: Parser;
  resultStr = '';
  result: Node[] = [];

  constructor(opt: Partial<Options>) {
    const {
      tabSize = defaultOptions.tabSize,
      maxLength = defaultOptions.maxLength,
      selfClose = defaultOptions.selfClose,
    } = opt;
    this.opt = {
      tabSize,
      maxLength,
      selfClose,
    };

    this.initStack();
    this.initParser();
  }

  private initStack() {
    this.stack = new Array<Node>() as Stack;
    this.stack.getLast = () => {
      return this.stack[this.stack.length - 1];
    };
  }

  private initParser() {
    this.parser = new Parser(
      {
        onopentag: this.onopentag,
        onclosetag: this.onclosetag,
        ontext: this.ontext,
        oncomment: this.oncomment,
      },
      { xmlMode: true, decodeEntities: false }
    );
  }

  private onopentag = (name: string, attrs: Attrs) => {
    const stack = this.stack;
    const { tabSize } = this.opt;

    const indent = stack.length * tabSize;
    const newNode: Node = { name, attrs, children: [], indent };

    this.handleOpentag(newNode);

    stack.push(newNode);
  };

  private onclosetag = (name: string) => {
    const { result } = this;
    const stack = this.stack;
    const node = stack.pop();

    if (!node) {
      throw `Parse error: no open tag for close tag ${name}`;
    } else {
      if (node.name !== name) {
        throw `Parse error: close tag does not match open tag: ${name}`;
      } else {
        const lastNode = stack.getLast();

        if (lastNode) {
          // 找到了 node 的 父 node
          lastNode.children.push(node);
        } else {
          // node 为顶层 node
          result.push(node);
        }

        this.handleClosetag(node);
      }
    }
  };

  private ontext = (text: string) => {
    const { stack } = this;
    const lastNode = stack.getLast();

    if (lastNode) {
      // 文本的父 node
      if (IGNORE_TAGS.includes(lastNode.name)) {
        lastNode.children.push(text); // 忽略标签内的文本不做 trim 处理

        this.handleText(text);
      } else {
        // const trimedText = text.trim();
        const trimedTextArr = text.split('').filter(char => char !== ' ');
        // 预期 trimedTextArr 全为换行符

        const trimedText = trimedTextArr.length >= 2 ? BR : '';

        if (trimedText.length > 0) {
          lastNode.children.push(trimedText);
          this.handleText(trimedText);
        }
      }
    } else {
      // 最外层的 node
      const trimedTextArr = text.split('').filter(char => char !== ' ');
      // 预期 trimedTextArr 全为换行符
      const trimedText = trimedTextArr.length >= 2 ? BR : '';
      this.handleText(trimedText);
    }
  };

  private oncomment = (comment: string) => {
    const { stack } = this;
    const lastNode = stack.getLast();

    if (lastNode) {
      // 注释的父 node
      lastNode.children.push({
        type: 'comment',
        value: comment,
      });
    }

    this.handleComment(lastNode, comment);
  };

  public parse(content: string) {
    this.reset();
    this.parser.write(content);
    this.parser.end();
  }

  public generateJSON() {
    return this.result;
  }

  public format(content: string) {
    this.parse(content);

    return this.resultStr;
  }

  private handleOpentag(newNode: Node) {
    const {
      stack,
      opt: { tabSize, maxLength },
    } = this;

    let opentagStr = '';

    const attrsTextWithoutBreak = generateAttrsText(newNode, false, tabSize);
    const { name, attrs, indent } = newNode;
    const lastNode = stack.getLast();
    if (lastNode && IGNORE_TAGS.includes(lastNode.name)) {
      opentagStr += `<${name}${attrsTextWithoutBreak}>`;
    } else {
      opentagStr = generateBlankSpace(indent);

      const opentagLength = getOpentagLength(name, attrsTextWithoutBreak, indent);
      if (opentagLength > maxLength) {
        // 超过最大长度限制，那么每个 attr 都要换行
        if (Object.keys(attrs).length === 0) {
          opentagStr += `<${name}>`;
        } else {
          opentagStr += `<${name}`;
          opentagStr += generateAttrsText(newNode, true, tabSize);
          opentagStr += `${BR}${generateBlankSpace(indent)}>`;
        }
      } else {
        opentagStr += `<${name}${attrsTextWithoutBreak}>`;
      }
      // 非忽略元素要换行
      if (this.resultStr.length > 0) {
        opentagStr = `${BR}${opentagStr}`;
      }
    }

    this.resultStr += opentagStr;
  }

  private handleClosetag(node: Node) {
    const { name, indent } = node;
    let closetagStr = '';

    const noChildren =
      node.children.length === 0 ||
      node.children.every(childNode => typeof childNode === 'string' && childNode.trim().length === 0);

    const selfClose = this.opt.selfClose && noChildren;

    if (selfClose) {
      this.resultStr = this.resultStr.slice(0, -1) + ' />';
      return;
    }

    if (IGNORE_TAGS.includes(name)) {
      // 忽略元素直接原地结束
      closetagStr = `</${name}>`;
    } else {
      if (node.children.length === 0) {
        // 无子元素，不换行
        closetagStr = `</${name}>`;
      } else {
        // 有子元素，要换行
        closetagStr = `${BR}${generateBlankSpace(indent)}</${name}>`;
      }
    }

    this.resultStr += closetagStr;
  }

  private handleText(text: string) {
    // text 统一不换行
    // 目前在 ttml 里，text 只会存在于 IGNORE_TAGS 标签内
    this.resultStr += text;
  }

  private handleComment(parentNode: Node | void, comment: string) {
    if (parentNode && IGNORE_TAGS.includes(parentNode.name)) {
      this.resultStr += `<!--${comment}-->`;
    } else {
      // comment 独占一行
      const indent = this.stack.length * this.opt.tabSize;
      let shouldBreak = this.resultStr.length > 0;
      if (shouldBreak) {
        this.resultStr += `${BR}${generateBlankSpace(indent)}<!--${comment}-->`;
      } else {
        this.resultStr += `${generateBlankSpace(indent)}<!--${comment}-->`;
      }
    }
  }

  private reset() {
    this.result = [];
    this.resultStr = '';
  }
}
