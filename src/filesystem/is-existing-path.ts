import nodeFs from 'node:fs/promises';

import { isSystemError } from '../utilities/is-system-error';

/**
 * Asynchronous version of `fs.exists`.
 */
export const isExistingPath = async (path: string): Promise<boolean> => {
  return nodeFs
    .stat(path)
    .then(() => true)
    .catch((error) => {
      if (isSystemError(error) && error.code === 'ENOENT') {
        return false;
      }

      throw error;
    });
};
