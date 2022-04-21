/* istanbul ignore file */
/* eslint-disable functional/no-this-expression */
/* eslint-disable functional/no-class */

/**
 * Error thrown when `getInput` is interrupted (ie. SIGINT).
 */
export class InputInterruptError extends Error {
  readonly name = 'InputInterruptError';
  readonly message = 'Interrupted';
  readonly toString = () => this.message;
}
