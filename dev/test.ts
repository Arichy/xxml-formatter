import * as Parser from '@byted/lepus-template-cli/src/ttml/markup-parser';
import Formatter from '../src';

import { sync } from 'glob';
import { strictEqual } from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const context = '/Users/xuyuqi/Documents/fe_lynx_main';

const result = sync('src/**/*.ttml', { cwd: context });

result.forEach((path) => {
  console.log(path);
  const absPath = resolve(context, path);

  const text = readFileSync(absPath, 'utf-8');

  const origin = text;
  const after = new Formatter({}).format(text);

  let parser1 = new Parser('tt', { original: '', filePath: absPath });
  parser1.end(origin);
  parser1.getResult();
  const a = JSON.stringify(parser1.render);

  let parser2 = new Parser('tt', { original: '', filePath: absPath });
  parser2.end(after);
  // parser2.getResult();
  const b = JSON.stringify(parser1.render);
  console.log(a === b);
  strictEqual(a, b);
});
