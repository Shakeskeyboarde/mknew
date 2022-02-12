import chalk from 'chalk';

/**
 * Print an error message to stderr (with color).
 *
 * This also sets `process.exitCode` to a value of `2` if it is not already
 * non-zero.
 */
export function printError(error: any): void {
  console.error(process.env.NODE_ENV === 'development' ? error : chalk.redBright(`${error?.message ?? error}`));
  process.exitCode = process.exitCode || 2;
}
