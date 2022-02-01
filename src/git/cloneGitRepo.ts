import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert';
import { GitSource } from './parseGitSource';
import { createGit } from './createGit';

export async function cloneGitRepo({ url, branch }: GitSource, dirname: string): Promise<string> {
  const temp = path.join(os.tmpdir(), 'mknew');

  await fs.mkdir(temp, { recursive: true });

  const tempname = await fs.mkdtemp(temp + path.sep);

  try {
    const git = createGit(tempname);

    await git('init');
    await git('config', 'core.sparseCheckout', 'true');
    await git('remote', 'add', '-f', 'origin', url);
    await fs.writeFile(
      path.join(tempname, '.git', 'info', 'sparse-checkout'),
      path.posix.join('/', dirname.replaceAll('\\', '/'), '*') + '\n',
    );

    if (!branch) {
      const remote = await git('remote', 'show', 'origin');
      branch = remote.match(/^\s*HEAD branch:\s*(.*)\s*$/m)?.[1];
      assert(branch, Error('Failed to detect Git repository default branch'));
    }

    await git('fetch', '--depth=1', 'origin', branch).catch(() => {
      // Fails if the branch is a commit hash.
    });
    await git('checkout', branch);
    await fs.rm(path.join(tempname, '.git'), { recursive: true, force: true }).catch(() => {
      // Not important.
    });
  } catch (error) {
    await fs.rm(tempname, { recursive: true, force: true }).catch(() => {});
    throw error;
  }

  return tempname;
}
