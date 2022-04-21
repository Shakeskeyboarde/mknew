import { isText } from 'istextorbinary';
import { constants as nodeFsConst } from 'node:fs';
import nodeFs from 'node:fs/promises';
import nodePath from 'node:path';

import { getFiles } from '../filesystem/get-files';
import { isExistingPath } from '../filesystem/is-existing-path';
import { createGit } from '../git/create-git';
import { getInput } from '../io/get-input';
import { isSystemError } from '../utilities/is-system-error';
import { runTasks } from '../utilities/run-tasks';
import { getPromptKey } from './get-prompt-key';
import { getResolvedTemplateText } from './get-resolved-template-text';
import { getTemplatePlaceholders } from './get-template-placeholders';

/**
 * Copy all files from a template to the target.
 */
export const copyTemplate = async (
  template: string,
  target: string,
  onError: (error: unknown) => void = () => undefined,
): Promise<void> => {
  const prompts: string[][] = [];
  const values = new Map<string, string>();
  const errorPaths = new Set<string>();
  const readTasks: (() => Promise<void>)[] = [];
  const writeTasks: (() => Promise<void>)[] = [];

  const read = async (path: string): Promise<void> => {
    const destinationFilename = nodePath.join(target, path);
    const filePrompts: string[] = [];

    prompts.push(filePrompts);

    if (await isExistingPath(destinationFilename)) {
      return;
    }

    const templateFilename = nodePath.join(template, path);
    const buffer = await nodeFs.readFile(templateFilename);
    let isTemplate = false;

    if (isText(templateFilename, buffer)) {
      for (const { prompt } of getTemplatePlaceholders(buffer.toString('utf-8'))) {
        isTemplate = true;
        filePrompts.push(prompt);
      }
    }

    const copy = isTemplate ? copyText : copyData;

    writeTasks.push(async () => copy(templateFilename, destinationFilename));
  };

  const resolve = async (prompt: string): Promise<void> => {
    const { key, isBuiltIn } = getPromptKey(prompt);

    if (values.has(key)) {
      return;
    }

    if (isBuiltIn) {
      switch (key) {
        case 'template.basename':
          values.set(key, nodePath.parse(nodePath.resolve(template)).name);
          break;
        case 'target.basename':
          values.set(key, nodePath.parse(nodePath.resolve(target)).name);
          break;
        case 'date.year':
          values.set(key, `${new Date().getFullYear()}`);
          break;
        case 'git.user.name':
          values.set(
            key,
            await createGit(process.cwd())('config', 'user.name').catch(() => {
              throw new Error('git user name not found');
            }),
          );
          break;
        case 'git.user.email':
          values.set(
            key,
            await createGit(process.cwd())('config', 'user.email').catch(() => {
              throw new Error('git user email not found');
            }),
          );
          break;
      }

      return;
    }

    values.set(key, await getInput(prompt));
  };

  const copyData = async (from: string, to: string): Promise<void> => {
    await nodeFs.mkdir(nodePath.dirname(to), { recursive: true });
    await nodeFs.copyFile(from, to, nodeFsConst.COPYFILE_EXCL);
  };

  const copyText = async (from: string, to: string): Promise<void> => {
    const inText = await nodeFs.readFile(from, 'utf-8');
    const outText = await getResolvedTemplateText(inText, async (prompt) => values.get(getPromptKey(prompt).key) ?? '');

    await nodeFs.mkdir(nodePath.dirname(to), { recursive: true });
    await nodeFs.writeFile(to, outText, { flag: 'wx' });
  };

  for await (const file of getFiles(template)) {
    readTasks.push(async () => read(file));
  }

  await runTasks(readTasks);

  for (const prompt of ([] as string[]).concat(...prompts)) {
    await resolve(prompt);
  }

  await runTasks(writeTasks, {
    onError: async (error) => {
      if (isSystemError(error)) {
        if (error.code === 'EEXIST') {
          // Ignore the error, because if a file already exists then it should be silently skipped.
          return;
        }

        if (error.path) {
          if (errorPaths.has(error.path)) {
            // Ignore the error, because an error has already been thrown for the path.
            return;
          }

          errorPaths.add(error.path);
        }
      }

      onError(error);
    },
  });
};
