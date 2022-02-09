export interface Placeholder {
  prompt: string;
  start: number;
  end: number;
}

/**
 * Find all of the placeholders in template text.
 */
export function* getTemplatePlaceholders(text: string): Generator<Placeholder, void> {
  const expression = /\{{3}[ \t]*([^{}\r\n \t][^{}\r\n]*?)[ \t]*\}{3}/gu;

  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while (null != (match = expression.exec(text))) {
    yield { prompt: match[1], start: match.index, end: expression.lastIndex };
    lastIndex = expression.lastIndex;
  }
}
