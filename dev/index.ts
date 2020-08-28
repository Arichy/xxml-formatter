import Formatter from '../src';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const text = readFileSync(resolve(__dirname, './index.ttml'), 'utf-8');
const tabSize = 2;
const maxLength = 80;

const formatter = new Formatter({
  tabSize,
  maxLength,
  selfClose: false,
});

formatter.parse(text);
const json = formatter.generateJSON();

writeFileSync(
  resolve(__dirname, './result.json'),
  JSON.stringify(json, null, 2)
);

const result = formatter.format(text);
writeFileSync(resolve(__dirname, './result.ttml'), result);
