import path from 'node:path';
import crossSpawn from 'cross-spawn';
import { GitError } from './GitError';

export function createGit(cwd: string): (...args: string[]) => Promise<string> {
  return async (...args: string[]): Promise<string> => {
    const process = crossSpawn('git', args, { stdio: 'overlapped', cwd: path.resolve(cwd) });

    return new Promise<string>((resolve, reject) => {
      const buffers: Buffer[] = [];

      process.stdout?.on('data', (data) => buffers.push(data));
      process.stderr?.on('data', (data) => buffers.push(data));
      process.on('error', (error) => reject(error));
      process.on('exit', (exitCode) => {
        const output = Buffer.concat(buffers).toString('utf-8').trim();

        if (exitCode !== 0) {
          reject(new GitError(exitCode ?? 1, output));
        } else {
          resolve(output);
        }
      });
    });
  };
}
