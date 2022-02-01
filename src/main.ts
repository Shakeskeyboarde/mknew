import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert';
import chalk from 'chalk';
import { getArg } from './io/getArg';
import { printUsage } from './io/printUsage';
import { printError } from './io/printError';
import { printWarning } from './io/printWarning';
import { parseGitSource } from './git/parseGitSource';
import { cloneGitRepo } from './git/cloneGitRepo';
import { applyTemplate } from './template/copyTemplate';

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
      assert(template, Error('Missing <template> argument'));
      assert(target, Error('Missing <target> argument'));
    } catch (error) {
      printUsage(error);
      return;
    }

    const gitSource = parseGitSource(source);
    const tempname = gitSource && (await cloneGitRepo(gitSource, template));

    if (tempname) {
      cleanupCallbacks.push(async () => fs.rm(tempname, { recursive: true, force: true }));
    }

    template = path.join(tempname || source, template);
    target = path.join(workspace, target);

    await applyTemplate(template, target, (error) => printWarning(error instanceof Error ? error.message : error));

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