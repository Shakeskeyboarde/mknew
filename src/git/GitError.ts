export class GitError extends Error {
  name = 'GitError';
  output: string;

  constructor(code: number, output = '') {
    super(`Git command exited with a non-zero status code (${code})`);
    this.output = output.trim();
  }

  toString = () => `${this.message}\n${this.output.trimStart()}`.trimEnd();
}
