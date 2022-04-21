export type GitSource = {
  readonly branch: string | undefined;
  readonly path: string | undefined;
  readonly url: string;
};

/**
 * Parse a git URL into the important parts (eg. url, path, and branch).
 */
export const parseGitSource = (source: string): GitSource | null => {
  const match = source.match(
    // eslint-disable-next-line unicorn/no-unsafe-regex
    /^((?:(?:git(?:\+ssh)?|ssh|https?):\/{2}(?:[^#\r\n]*?(?=\.git(?:[/#]|$)|#|$))|[-\w.]+@[^:#\r\n]*:[^#\r\n]*?(?:[^#\r\n]*?(?=\.git(?:[/#]|$)|#|$))|file:[^#\r\n]*?\.git(?=[/#]|$))(?:\.git(?=[/#]|$))?)(?:\/+([^#\r\n]*))?(?:#(.*))?$/,
  );

  return match ? { branch: match[3] || undefined, path: match[2] || undefined, url: match[1] } : null;
};
