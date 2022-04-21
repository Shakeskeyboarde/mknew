import nodeAssert from 'node:assert';
import nodeFs from 'node:fs/promises';
import nodeOs from 'node:os';
import nodePath from 'node:path';

import { createGit } from './create-git';
import { type GitSource } from './parse-git-source';

/**
 * Clone a git repository into a temporary directory, and return the temporary
 * directory path.
 */
export const cloneGitRepo = async ({ url, path = '', branch }: GitSource, subPath = ''): Promise<string> => {
  const temporaryRoot = nodePath.join(nodeOs.tmpdir(), 'mknew');

  await nodeFs.mkdir(temporaryRoot, { recursive: true });

  const temporary = await nodeFs.mkdtemp(temporaryRoot + nodePath.sep);

  try {
    const git = createGit(temporary);

    await git('init');
    await git('config', 'core.sparseCheckout', 'true');
    await git('remote', 'add', '-f', 'origin', url);
    await nodeFs.writeFile(
      nodePath.join(temporary, '.git', 'info', 'sparse-checkout'),
      nodePath.posix.join('/', path, subPath.replaceAll('\\', '/'), '*') + '\n',
    );

    if (!branch) {
      const remote = await git('remote', 'show', 'origin');
      branch = remote.match(/^\s*HEAD branch:\s*(.*)\s*$/m)?.[1];
      nodeAssert(branch, new Error('failed to detect Git repository default branch'));
    }

    await git('fetch', '--depth=1', 'origin', branch).catch(() => {
      // Fails if the branch is a commit hash.
    });
    await git('checkout', branch);
    await nodeFs.rm(nodePath.join(temporary, '.git'), { force: true, recursive: true }).catch(() => {
      // Not important.
    });
  } catch (error) {
    await nodeFs.rm(temporary, { force: true, recursive: true }).catch(() => undefined);
    throw error;
  }

  return temporary;
};
