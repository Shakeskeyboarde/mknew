import nodeFs from 'node:fs/promises';
import nodePath from 'node:path';
import nodeAssert from 'node:assert';
import chalk from 'chalk';
import arg from 'arg';
import { printUsage } from './io/printUsage';
import { printError } from './io/printError';
import { printWarning } from './io/printWarning';
import { parseGitSource } from './git/parseGitSource';
import { cloneGitRepo } from './git/cloneGitRepo';
import { copyTemplate } from './template/copyTemplate';

export async function main(argv = process.argv.slice(2)): Promise<void> {
  const cleanupCallbacks: (() => Promise<void>)[] = [];

  try {
    const options = arg(
      {
        '--help': Boolean,
        '--version': Boolean,
        '--source': String,
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
      console.log(require('../package.json').version);
      return;
    }

    const source = options['--source'] || process.env.MKNEW_SOURCE || '.';
    const workspace = options['--workspace'] || process.env.MKNEW_WORKSPACE || '.';

    let [template, target] = options._;

    nodeAssert(template, Error('missing <template> argument'));
    nodeAssert(target, Error('missing <target> argument'));

    const gitSource = parseGitSource(source);

    if (gitSource) {
      console.log(
        chalk.cyanBright(`Copying "${nodePath.posix.join(gitSource.path ?? '', template)}" (${gitSource.url})`),
      );
    } else {
      console.log(chalk.cyanBright(`Copying "${nodePath.join(source, template)}"`));
    }

    const gitTemp = gitSource && (await cloneGitRepo(gitSource, template));

    if (gitTemp) {
      cleanupCallbacks.push(async () => nodeFs.rm(gitTemp, { recursive: true, force: true }));
    }

    template = gitTemp ? nodePath.join(gitTemp, gitSource.path ?? '', template) : nodePath.join(source, template);
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
}
