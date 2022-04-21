/* istanbul ignore file */
/* eslint-disable functional/no-this-expression */
/* eslint-disable functional/no-class */

/**
 * Error thrown when a Git command fails.
 */
export class GitError extends Error {
  readonly name = 'GitError';
  readonly exitCode: number;
  readonly output: string;

  constructor(exitCode: number, output = '') {
    super(`Git command exited with a non-zero status code (${exitCode})`);
    this.exitCode = exitCode;
    this.output = output.trim();
  }

  readonly toString = () => `${this.message}\n${this.output.trimStart()}`.trimEnd();
}
