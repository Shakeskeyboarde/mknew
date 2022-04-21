import nodePath from 'node:path';

import { createGit } from './create-git';

/**
 * List all Git ignored files (absolute paths). All files in the Git _root_ are
 * listed, even if `path` is not the root.
 */
export const getGitIgnored = async (path: string): Promise<string[]> => {
  try {
    const git = createGit(path);
    const root = await git('rev-parse', '--show-toplevel');
    const output = await git('status', '--ignored', '--porcelain');
    const lines = output.split(/\r?\n/g);

    return lines
      .filter((line) => line.startsWith('!! '))
      .map((line) => line.slice(3))
      .map((line) => nodePath.resolve(root, line));
  } catch (error) {
    return [];
  }
};
