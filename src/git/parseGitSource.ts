export interface GitSource {
  url: string;
  path: string | undefined;
  branch: string | undefined;
}

/**
 * Parse a git URL into the important parts (eg. url, path, and branch).
 */
export function parseGitSource(source: string): GitSource | null {
  const match = source.match(
    /^((?:(?:git(?:\+ssh)?|ssh|https?):\/{2}(?:[^#\r\n]*?(?=\.git(?:[\/#]|$)|#|$))|[-\w.]+@[^:#\r\n]*:[^#\r\n]*?(?:[^#\r\n]*?(?=\.git(?:[\/#]|$)|#|$))|file:[^#\r\n]*?\.git(?=[\/#]|$))(?:\.git(?=[\/#]|$))?)(?:\/+([^#\r\n]*))?(?:#(.*))?$/,
  );

  return match ? { url: match[1], path: match[2] || undefined, branch: match[3] || undefined } : null;
}
