import nodeFs from 'node:fs/promises';
import nodePath from 'node:path';
import { getGitIgnored } from '../git/getGitIgnored';

/**
 * Iterate over all files (not directories) starting at root.
 *
 * Files matched by `.gitignore` are skipped (_only_ when `root` is tracked by
 * Git).
 */
export async function* getFiles(path: string): AsyncGenerator<string, void> {
  const stats = await nodeFs.stat(path);

  if (!stats.isDirectory()) {
    yield '.';
    return;
  }

  const ignored = await getGitIgnored(path);

  async function* ls(subPath: string): AsyncGenerator<string, void> {
    const entries = await nodeFs.readdir(nodePath.join(path, subPath), { withFileTypes: true });
    const directories: string[] = [];

    for (const entry of entries) {
      const entryPath = nodePath.join(subPath, entry.name);

      if (entry.name === '.git' || ignored.includes(nodePath.resolve(path, entryPath))) {
        continue;
      }

      if (entry.isDirectory()) {
        directories.push(entryPath);
      } else {
        yield entryPath;
      }
    }

    for (const directory of directories) {
      yield* ls(directory);
    }
  }

  yield* ls('.');
}
