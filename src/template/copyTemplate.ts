import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isText } from 'istextorbinary';
import { getFilenames } from '../filesystem/getFilenames';
import { isExistingPath } from '../filesystem/isExistingPath';
import { isPathExistsError } from '../filesystem/isPathExistsError';
import { getInput } from '../io/getInput';
import { getTemplatePlaceholders } from './getTemplatePlaceholders';
import { getResolvedTemplateText } from './getResolvedTemplateText';

export async function applyTemplate(
  template: string,
  target: string,
  onWriteFail: (error: unknown) => void,
): Promise<void> {
  const values = new Map<string, string>();
  const actions: (() => Promise<void>)[] = [];
  const dirnames = new Map<string, boolean>();

  function createAction(
    templateFilename: string,
    destinationFilename: string,
    isTextFile: boolean,
  ): () => Promise<void> {
    return async () => {
      const dirname = path.dirname(destinationFilename);

      if (!dirnames.has(dirname)) {
        try {
          await fs.mkdir(dirname, { recursive: true });
          dirnames.set(dirname, true);
        } catch (error) {
          dirnames.set(dirname, false);
          onWriteFail(error);
          return;
        }
      } else if (!dirnames.get(dirname)) {
        return;
      }

      try {
        if (isTextFile) {
          const inText = await fs.readFile(templateFilename, 'utf-8');
          const outText = await getResolvedTemplateText(inText, async (key) => values.get(key) ?? '');

          await fs.writeFile(destinationFilename, outText, { flag: 'wx' });
        } else {
          await fs.copyFile(templateFilename, destinationFilename, fsSync.constants.COPYFILE_EXCL);
        }
      } catch (error) {
        if (!isPathExistsError(error)) {
          onWriteFail(error);
        }
      }
    };
  }

  for await (const filename of getFilenames(template)) {
    const destinationFilename = path.join(target, filename);

    if (await isExistingPath(destinationFilename)) {
      continue;
    }

    const templateFilename = path.join(template, filename);
    const buffer = await fs.readFile(templateFilename);
    const isTextFile = isText(templateFilename, buffer) ?? false;

    if (isTextFile) {
      for (const { key } of getTemplatePlaceholders(buffer.toString('utf-8'))) {
        if (values.has(key)) {
          continue;
        }

        switch (key) {
          case '&template':
            values.set(key, path.parse(path.resolve(template)).name);
            break;
          case '&target':
            values.set(key, path.parse(path.resolve(target)).name);
            break;
          default:
            values.set(key, await getInput(key));
            break;
        }
      }
    }

    actions.push(createAction(templateFilename, destinationFilename, isTextFile));
  }

  for (const action of actions) {
    await action();
  }
}
