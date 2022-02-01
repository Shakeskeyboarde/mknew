import fs from 'node:fs/promises';

export async function isExistingPath(pathname: string): Promise<boolean> {
  return fs.stat(pathname)
    .then(() => true)
    .catch(() => false);
}
