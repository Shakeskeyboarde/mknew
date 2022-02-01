export interface GitSource {
  url: string;
  branch?: string;
}

export function parseGitSource(source: string): GitSource | null {
  const match = source.match(
    /^((?:git(?:\+ssh)?|ssh|https?):\/{2}[^#\r\n]*?|[-\w.]+@[^:#\r\n]*:[^#\r\n]*|file:[^#\r\n]*\.git)(?:#(.*))?$/,
  );

  return match ? { url: match[1], branch: match[2] } : null;
}
