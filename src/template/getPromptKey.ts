/**
 * Get a normalized key from a formatted template prompt.
 */
export function getPromptKey(prompt: string): string {
  return prompt
    .toLocaleLowerCase()
    .replace(/[\s:;.,!?_=-]+/g, '-')
    .replace(/(?:^-+|-+$)/g, '');
}
