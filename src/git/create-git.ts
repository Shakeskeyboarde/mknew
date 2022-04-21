import crossSpawn from 'cross-spawn';
import nodePath from 'node:path';

import { GitError } from './git-error';

/**
 * Create a Git command runner bound to a working directory. Git command output
 * is returned (stdout + stderr). If the command exits with a non-zero code,
 * then a `GitError` is thrown.
 */
export const createGit = (cwd: string): ((...args: string[]) => Promise<string>) => {
  return async (...args: string[]): Promise<string> => {
    const process = crossSpawn('git', args, { cwd: nodePath.resolve(cwd), stdio: 'overlapped' });

    return new Promise<string>((resolve, reject) => {
      const buffers: Buffer[] = [];

      process.stdout?.on('data', (data) => buffers.push(data));
      process.stderr?.on('data', (data) => buffers.push(data));
      process.on('error', reject);
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
};
