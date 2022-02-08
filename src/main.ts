import nodeFs from 'node:fs/promises';
import nodePath from 'node:path';
import nodeAssert from 'node:assert';
import chalk from 'chalk';
import { getArg } from './io/getArg';
import { printUsage } from './io/printUsage';
import { printError } from './io/printError';
import { printWarning } from './io/printWarning';
import { parseGitSource } from './git/parseGitSource';
import { cloneGitRepo } from './git/cloneGitRepo';
import { copyTemplate } from './template/copyTemplate';

export async function main(args = process.argv.slice(2)): Promise<void> {
  const cleanupCallbacks: (() => Promise<void>)[] = [];

  try {
    if (args.includes('--help')) {
      printUsage();
      return;
    }

    const source = getArg(args, '-s', '--source') ?? '.';
    const workspace = getArg(args, '-w', '--workspace') ?? '.';

    let [template, target] = args;

    try {
      nodeAssert(template, Error('Missing <template> argument'));
      nodeAssert(target, Error('Missing <target> argument'));
    } catch (error) {
      printUsage();
      printError(error);
      return;
    }

    const gitSource = parseGitSource(source);
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
