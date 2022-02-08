/* istanbul ignore file */

/**
 * Error thrown when a Git command fails.
 */
export class GitError extends Error {
  name = 'GitError';
  exitCode: number;
  output: string;

  constructor(exitCode: number, output = '') {
    super(`Git command exited with a non-zero status code (${exitCode})`);
    this.exitCode = exitCode;
    this.output = output.trim();
  }

  toString = () => `${this.message}\n${this.output.trimStart()}`.trimEnd();
}
