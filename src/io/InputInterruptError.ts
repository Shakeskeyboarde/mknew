/* istanbul ignore file */

/**
 * Error thrown when `getInput` is interrupted (ie. SIGINT).
 */
export class InputInterruptError extends Error {
  name = 'InputInterruptError';
  message = 'Interrupted';
  toString = () => this.message;
}
