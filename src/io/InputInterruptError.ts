export class InputInterruptError extends Error {
  name = 'InputInterruptError';
  message = 'Interrupted';
  toString = () => this.message;
}
