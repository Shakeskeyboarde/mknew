import chalk from 'chalk';
import nodeReadline from 'node:readline';

import { InputInterruptError } from './input-interrupt-error';

/**
 * Get input on the command line interactively.
 */
export const getInput = async (message: string): Promise<string> => {
  const readline = nodeReadline.createInterface(process.stdin, process.stdout);
  const promptMessage = message.trim().replace(/[=:.!?]?$/iu, (match) => match || ':');

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
};
