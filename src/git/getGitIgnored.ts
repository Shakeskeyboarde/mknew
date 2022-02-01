import path from 'node:path';
import { createGit } from './createGit';

export async function getGitIgnored(dirname: string): Promise<string[]> {
  try {
    const git = createGit(dirname);
    const root = await git('rev-parse', '--show-toplevel');
    const output = await git('status', '--ignored', '--porcelain');
    const lines = output.split(/\r?\n/g);

    return lines
      .filter((line) => line.startsWith('!! '))
      .map((line) => line.slice(3))
      .map((pathname) => path.resolve(root, pathname));
  } catch (error) {
    return [];
  }
}
