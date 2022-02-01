import chalk from 'chalk';

export function printError(error: unknown): void {
  console.error(chalk.redBright(`${error}`));
  process.exitCode = 2;
}
