export type Placeholder = {
  readonly end: number;
  readonly prompt: string;
  readonly start: number;
};

/**
 * Find all of the placeholders in template text.
 */
export const getTemplatePlaceholders = function* (text: string): Generator<Placeholder, void> {
  const expression =
    /\{{3}[ \t]*([^~{}\r\n \t][^~{}\r\n]*?)[ \t]*\}{3}|~{3}[ \t]*([^~{}\r\n \t][^~{}\r\n]*?)[ \t]*~{3}/gu;

  let match: RegExpExecArray | null = null;

  while (null != (match = expression.exec(text))) {
    yield { end: expression.lastIndex, prompt: match[1] || match[2], start: match.index };
  }
};
