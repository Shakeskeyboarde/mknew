import chalk from 'chalk';

/**
 * Print a warning message to stderr (with color).
 *
 * This also sets `process.exitCode` to a value of `1` if it is not already
 * non-zero.
 */
export const printWarning = (error: unknown): void => {
  console.error(chalk.yellowBright(`${error}`));
  process.exitCode = 1;
};
