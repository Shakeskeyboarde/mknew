import nodeFs from 'node:fs/promises';
import nodePath from 'node:path';
import nodeOs from 'node:os';
import nodeAssert from 'node:assert';
import { GitSource } from './parseGitSource';
import { createGit } from './createGit';

/**
 * Clone a git repository into a temporary directory, and return the temporary
 * directory path.
 */
export async function cloneGitRepo({ url, path = '', branch }: GitSource, subPath = ''): Promise<string> {
  const tempRoot = nodePath.join(nodeOs.tmpdir(), 'mknew');

  await nodeFs.mkdir(tempRoot, { recursive: true });

  const temp = await nodeFs.mkdtemp(tempRoot + nodePath.sep);

  try {
    const git = createGit(temp);

    await git('init');
    await git('config', 'core.sparseCheckout', 'true');
    await git('remote', 'add', '-f', 'origin', url);
    await nodeFs.writeFile(
      nodePath.join(temp, '.git', 'info', 'sparse-checkout'),
      nodePath.posix.join('/', path, subPath.replaceAll('\\', '/'), '*') + '\n',
    );

    if (!branch) {
      const remote = await git('remote', 'show', 'origin');
      branch = remote.match(/^\s*HEAD branch:\s*(.*)\s*$/m)?.[1];
      nodeAssert(branch, Error('failed to detect Git repository default branch'));
    }

    await git('fetch', '--depth=1', 'origin', branch).catch(() => {
      // Fails if the branch is a commit hash.
    });
    await git('checkout', branch);
    await nodeFs.rm(nodePath.join(temp, '.git'), { recursive: true, force: true }).catch(() => {
      // Not important.
    });
  } catch (error) {
    await nodeFs.rm(temp, { recursive: true, force: true }).catch(() => {});
    throw error;
  }

  return temp;
}
