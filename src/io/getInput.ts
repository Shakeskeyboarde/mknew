import readline from 'node:readline';
import chalk from 'chalk';
import { InputInterruptError } from './InputInterruptError';

export async function getInput(message: string): Promise<string> {
  const rl = readline.createInterface(process.stdin, process.stdout);
  const promptMessage = message.trim().replace(/[^a-z0-9]?$/iu, (match) => match || ':');

  return new Promise((resolve, reject) => {
    rl.question(chalk.bold(`${promptMessage} `), (value) => {
      rl.close();
      resolve(value);
    });
    rl.on('SIGINT', () => {
      rl.close();
      console.log();
      reject(new InputInterruptError());
    });
  });
}
