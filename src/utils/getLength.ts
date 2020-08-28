export function getOpentagLength(
  name: string,
  attrsText: string,
  indent: number
) {
  return `<${name}${attrsText}>`.length + indent;
}
