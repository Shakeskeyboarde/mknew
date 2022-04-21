import { getTemplatePlaceholders } from './get-template-placeholders';

/**
 * Replace all placeholders in a string.
 */
export const getResolvedTemplateText = async (
  text: string,
  getReplacement: (prompt: string) => Promise<string>,
): Promise<string> => {
  let lastIndex = 0;
  let output = '';

  for await (const { prompt, start, end } of getTemplatePlaceholders(text)) {
    output += text.slice(lastIndex, start);
    output += await getReplacement(prompt);
    lastIndex = end;
  }

  return output + text.slice(lastIndex);
};
