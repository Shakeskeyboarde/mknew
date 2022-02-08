import nodeFs from 'node:fs/promises';
import { isSystemError } from '../utilities/isSystemError';

/**
 * Asynchronous version of `fs.exists`.
 */
export async function isExistingPath(path: string): Promise<boolean> {
  return nodeFs
    .stat(path)
    .then(() => true)
    .catch((error) => {
      if (isSystemError(error) && error.code === 'ENOENT') {
        return false;
      }

      throw error;
    });
}
