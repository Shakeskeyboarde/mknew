import nodeReadline from 'node:readline';
import chalk from 'chalk';
import { InputInterruptError } from './InputInterruptError';

/**
 * Get input on the command line interactively.
 */
export async function getInput(message: string): Promise<string> {
  const readline = nodeReadline.createInterface(process.stdin, process.stdout);
  const promptMessage = message.trim().replace(/[^a-z0-9]?$/iu, (match) => match || ':');

  return new Promise((resolve, reject) => {
    readline.question(chalk.bold(`${promptMessage} `), (value) => {
      readline.close();
      resolve(value);
    });
    readline.on('SIGINT', () => {
      readline.close();
      console.log();
      reject(new InputInterruptError());
    });
  });
}
