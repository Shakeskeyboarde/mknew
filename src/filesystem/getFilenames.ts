import fs from 'node:fs/promises';
import path from 'node:path';
import { getGitIgnored } from '../git/getGitIgnored';

export async function* getFilenames(root: string): AsyncGenerator<string, void> {
  const stats = await fs.stat(root);

  if (!stats.isDirectory()) {
    yield '.';
    return;
  }

  const ignored = await getGitIgnored(root);

  async function* ls(dirname: string): AsyncGenerator<string, void> {
    const entries = await fs.readdir(path.join(root, dirname), { withFileTypes: true });
    const dirnames: string[] = [];

    for (const entry of entries) {
      const pathname = path.join(dirname, entry.name);

      if (entry.name === '.git' || ignored.includes(path.resolve(root, pathname))) {
        continue;
      }

      if (entry.isDirectory()) {
        dirnames.push(pathname);
      } else {
        yield pathname;
      }
    }

    for (const dirname of dirnames) {
      yield* ls(dirname);
    }
  }

  yield* ls('.');
}
