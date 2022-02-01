import chalk from 'chalk';

export function printWarning(error: unknown): void {
  console.error(chalk.yellowBright(`${error}`));
  process.exitCode = 1;
}
