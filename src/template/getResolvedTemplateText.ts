import { getTemplatePlaceholders } from './getTemplatePlaceholders';

/**
 * Replace all placeholders in a string.
 */
export async function getResolvedTemplateText(
  text: string,
  getReplacement: (prompt: string) => Promise<string>,
): Promise<string> {
  let lastIndex = 0;
  let output = '';

  for await (const { prompt, start, end } of getTemplatePlaceholders(text)) {
    output += text.slice(lastIndex, start);
    output += await getReplacement(prompt);
    lastIndex = end;
  }

  return output + text.slice(lastIndex);
}
