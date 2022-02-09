import { constants as nodeFsConst } from 'node:fs';
import nodeFs from 'node:fs/promises';
import nodePath from 'node:path';
import { isText } from 'istextorbinary';
import { runTasks } from '../utilities/runTasks';
import { getFiles } from '../filesystem/getFiles';
import { isExistingPath } from '../filesystem/isExistingPath';
import { getInput } from '../io/getInput';
import { getTemplatePlaceholders } from './getTemplatePlaceholders';
import { getResolvedTemplateText } from './getResolvedTemplateText';
import { isSystemError } from '../utilities/isSystemError';
import { getPromptKey } from './getPromptKey';

/**
 * Copy all files from a template to the target.
 */
export async function copyTemplate(
  template: string,
  target: string,
  onError: (error: unknown) => void = () => {},
): Promise<void> {
  const prompts: string[][] = [];
  const values = new Map<string, string>();
  const errorPaths = new Set<string>();
  const readTasks: (() => Promise<void>)[] = [];
  const writeTasks: (() => Promise<void>)[] = [];

  async function read(path: string): Promise<void> {
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
  }

  async function resolve(prompt: string): Promise<void> {
    const key = getPromptKey(prompt);

    if (values.has(key)) {
      return;
    }

    switch (key) {
      case '&template':
        values.set(key, nodePath.parse(nodePath.resolve(template)).name);
        break;
      case '&target':
        values.set(key, nodePath.parse(nodePath.resolve(target)).name);
        break;
      case '&year':
        values.set(key, `${new Date().getFullYear()}`);
        break;
      default:
        values.set(key, await getInput(prompt));
        break;
    }
  }

  async function copyData(from: string, to: string): Promise<void> {
    await nodeFs.mkdir(nodePath.dirname(to), { recursive: true });
    await nodeFs.copyFile(from, to, nodeFsConst.COPYFILE_EXCL);
  }

  async function copyText(from: string, to: string): Promise<void> {
    const inText = await nodeFs.readFile(from, 'utf-8');
    const outText = await getResolvedTemplateText(inText, async (prompt) => values.get(getPromptKey(prompt)) ?? '');

    await nodeFs.mkdir(nodePath.dirname(to), { recursive: true });
    await nodeFs.writeFile(to, outText, { flag: 'wx' });
  }

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
}
