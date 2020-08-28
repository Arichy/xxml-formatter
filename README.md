# xxml-formatter

A formatter for xxml based on `htmlparser2`

xxml is a kind of DSL used wildly by Chinese microapps such as:

- .wxml - Weixin microapp
- .ttml - Bytedance microapp
- .swan - Baidu microapp
- .axml - Alipay microapp

<!-- ## Installation

    npm install htmlparser2

A live demo of htmlparser2 is available [here](https://astexplorer.net/#/2AmVrGuGVJ). -->

## Usage

```typescript
import Formatter from 'xxml-formatter';
const formatter = new Formatter({ tabSize: 2 });

const sourceCode = `<view><text>hello world</text></view>`;
const resultCode = formatter.format(sourceCode);
console.log(resultCode);
```

Output (simplified):

```
<view>
  <text>hello world</text>
</view>
```
