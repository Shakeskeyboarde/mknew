import { getTemplatePlaceholders } from './getTemplatePlaceholders';

export async function getResolvedTemplateText(text: string, getReplacement: (key: string) => Promise<string>): Promise<string> {
  let lastIndex = 0;
  let output = '';

  for await (const { key, start, end } of getTemplatePlaceholders(text)) {
    output += text.slice(lastIndex, start);
    output += await getReplacement(key);
    lastIndex = end;
  }

  return output + text.slice(lastIndex);
}
