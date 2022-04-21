import arg from 'arg';
import chalk from 'chalk';
import nodeAssert from 'node:assert';
import nodeFs from 'node:fs/promises';
import nodePath from 'node:path';

import { cloneGitRepo } from './git/clone-git-repo';
import { parseGitSource } from './git/parse-git-source';
import { printError } from './io/print-error';
import { printUsage } from './io/print-usage';
import { printWarning } from './io/print-warning';
import { copyTemplate } from './template/copy-template';

export const main = async (argv = process.argv.slice(2)): Promise<void> => {
  const cleanupCallbacks: (() => Promise<void>)[] = [];

  try {
    const options = arg(
      {
        '--help': Boolean,
        '--source': String,
        '--version': Boolean,
        '--workspace': String,
        '-s': '--source',
        '-w': '--workspace',
      },
      { argv },
    );

    if (options['--help']) {
      printUsage();
      return;
    }

    if (options['--version']) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      console.log(require('../package.json').version);
      return;
    }

    const source = options['--source'] || process.env.MKNEW_SOURCE || '.';
    const workspace = options['--workspace'] || process.env.MKNEW_WORKSPACE || '.';

    let [template, target] = options._;

    nodeAssert(template, new Error('missing <template> argument'));
    nodeAssert(target, new Error('missing <target> argument'));

    const gitSource = parseGitSource(source);

    if (gitSource) {
      console.log(
        chalk.cyanBright(`Copying "${nodePath.posix.join(gitSource.path ?? '', template)}" (${gitSource.url})`),
      );
    } else {
      console.log(chalk.cyanBright(`Copying "${nodePath.join(source, template)}"`));
    }

    const gitTemporary = gitSource && (await cloneGitRepo(gitSource, template));

    if (gitTemporary) {
      cleanupCallbacks.push(async () => nodeFs.rm(gitTemporary, { force: true, recursive: true }));
    }

    template = gitTemporary
      ? nodePath.join(gitTemporary, gitSource.path ?? '', template)
      : nodePath.join(source, template);
    target = nodePath.join(workspace, target);

    await copyTemplate(template, target, (error) => printWarning(error instanceof Error ? error.message : error));

    if (process.exitCode) {
      console.log(chalk.yellowBright(`Created "${target}" (with warnings)`));
    } else {
      console.log(chalk.greenBright(`Created "${target}"`));
    }
  } catch (error) {
    printError(error);
  } finally {
    for (const cleanup of cleanupCallbacks) {
      cleanup().catch(printWarning);
    }
  }
};
