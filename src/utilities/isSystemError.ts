function isError(error: unknown): error is Error & { code?: unknown; path?: unknown } {
  return error instanceof Error;
}

/**
 * Return true if the error parameter is a NodeJS `SystemError`, which has a
 * `code` and `path` property.
 */
export function isSystemError(error: unknown): error is Error & { code: string; path?: string } {
  return (
    isError(error) &&
    typeof error.code === 'string' &&
    (typeof error.path === 'string' || typeof error.path === 'undefined')
  );
}
