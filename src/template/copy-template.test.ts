import { isText } from 'istextorbinary';
import nodeFs from 'node:fs/promises';
import nodePath from 'node:path';

import { getFiles } from '../filesystem/get-files';
import { isExistingPath } from '../filesystem/is-existing-path';
import { getInput } from '../io/get-input';
import { copyTemplate } from './copy-template';

jest.mock('node:fs/promises', () => ({
  copyFile: jest.fn(),
  mkdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));
jest.mock('istextorbinary', () => ({
  isText: jest.fn(),
}));
jest.mock('../filesystem/get-files', () => ({
  getFiles: jest.fn(),
}));
jest.mock('../filesystem/is-existing-path', () => ({
  isExistingPath: jest.fn(),
}));
jest.mock('../io/get-input', () => ({
  getInput: jest.fn(),
}));
jest.mock('../git/create-git', () => ({
  // eslint-disable-next-line unicorn/consistent-function-scoping
  createGit: () => async (_: unknown, config: string) => config.includes('name') ? 'John' : 'john@email.com',
}));

describe('applyTemplate', () => {
  const files = new Map<string, string>();

  const inputs: unknown[] = [];
  let written: [string, ...unknown[]][] = [];
  let copied: [string, ...unknown[]][] = [];
  let mkdirs: [string, ...unknown[]][] = [];
  let errors: unknown[] = [];

  const onError = (error: unknown) => {
    errors.push(error);
  };

  beforeEach(() => {
    (nodeFs.readFile as jest.Mock).mockImplementation(async (path, options) => {
      const text = files.get(path) ?? '';
      return options === 'utf-8' ? text : Buffer.from(text, 'utf-8');
    });
    (nodeFs.writeFile as jest.Mock).mockImplementation(async (...args) => {
      written.push(args);
    });
    (nodeFs.copyFile as jest.Mock).mockImplementation(async (...args) => {
      copied.push(args);
    });
    (nodeFs.mkdir as jest.Mock).mockImplementation(async (...args) => {
      mkdirs.push(args);
    });
    (isText as jest.Mock).mockReturnValue(true);
    (getFiles as jest.Mock).mockImplementation(async function* (root): AsyncGenerator {
      for (const file of files.keys()) {
        yield nodePath.relative(root, file);
      }
    });
    (isExistingPath as jest.Mock).mockResolvedValue(false);
    (getInput as jest.Mock).mockImplementation(async (message) => {
      inputs.push(message);
      return `(input-${message})`;
    });
  });

  afterEach(() => {
    files.clear();
    written = [];
    copied = [];
    mkdirs = [];
    errors = [];
  });

  test('empty directory', async () => {
    await copyTemplate('from', 'to', onError);

    expect(inputs).toMatchInlineSnapshot(`Array []`);
    expect(written).toMatchInlineSnapshot(`Array []`);
    expect(copied).toMatchInlineSnapshot(`Array []`);
    expect(mkdirs).toMatchInlineSnapshot(`Array []`);
    expect(errors).toMatchInlineSnapshot(`Array []`);
  });

  test('no errors', async () => {
    files.set('from/a', 'a:{{{1}}}');
    files.set('from/b', 'b:{{{1}}}{{{2}}}');
    files.set('from/c', 'c');
    files.set('from/d/a', 'd/a:{{{3}}}');
    files.set('from/d/b', 'd/b');
    files.set('from/e', '');
    (isText as jest.Mock).mockImplementation((path) => path !== 'from/d/a');
    (isExistingPath as jest.Mock).mockImplementation((path) => path === 'to/e');

    await copyTemplate('from', 'to', onError);

    expect(inputs).toMatchInlineSnapshot(`
      Array [
        "1",
        "2",
      ]
    `);
    expect(written.sort((a, b) => a[0].localeCompare(b[0]))).toMatchInlineSnapshot(`
      Array [
        Array [
          "to/a",
          "a:(input-1)",
          Object {
            "flag": "wx",
          },
        ],
        Array [
          "to/b",
          "b:(input-1)(input-2)",
          Object {
            "flag": "wx",
          },
        ],
      ]
    `);
    expect(copied.sort((a, b) => a[0].localeCompare(b[0]))).toMatchInlineSnapshot(`
      Array [
        Array [
          "from/c",
          "to/c",
          1,
        ],
        Array [
          "from/d/a",
          "to/d/a",
          1,
        ],
        Array [
          "from/d/b",
          "to/d/b",
          1,
        ],
      ]
    `);
    expect(mkdirs.sort((a, b) => a[0].localeCompare(b[0]))).toMatchInlineSnapshot(`
      Array [
        Array [
          "to",
          Object {
            "recursive": true,
          },
        ],
        Array [
          "to",
          Object {
            "recursive": true,
          },
        ],
        Array [
          "to",
          Object {
            "recursive": true,
          },
        ],
        Array [
          "to/d",
          Object {
            "recursive": true,
          },
        ],
        Array [
          "to/d",
          Object {
            "recursive": true,
          },
        ],
      ]
    `);
    expect(errors).toMatchInlineSnapshot(`Array []`);
  });

  test('create directory error', async () => {
    files.set('from/a', '');
    files.set('from/b/a', '');
    files.set('from/b/b', '');
    const error = Object.assign(new Error('error'), { code: 'FOO', path: 'to/b' });
    (nodeFs.mkdir as jest.Mock).mockImplementation(async (path, ...args) => {
      mkdirs.push([path, ...args]);

      if (path === 'to/b') {
        throw error;
      }
    });
    const localOnError = jest.fn();

    await copyTemplate('from', 'to', localOnError);

    expect(localOnError).toHaveBeenCalledTimes(1);
    expect(localOnError).toHaveBeenLastCalledWith(error);
    expect(written.sort((a, b) => a[0].localeCompare(b[0]))).toMatchInlineSnapshot(`Array []`);
    expect(mkdirs.sort((a, b) => a[0].localeCompare(b[0]))).toMatchInlineSnapshot(`
      Array [
        Array [
          "to",
          Object {
            "recursive": true,
          },
        ],
        Array [
          "to/b",
          Object {
            "recursive": true,
          },
        ],
        Array [
          "to/b",
          Object {
            "recursive": true,
          },
        ],
      ]
    `);
  });

  test('write file error', async () => {
    files.set('from/a', '{{{1}}}');
    files.set('from/b', '{{{1}}}');
    const localOnError = jest.fn();
    const error = new Error('error');
    (nodeFs.writeFile as jest.Mock).mockImplementation(async (path, ...args) => {
      written.push([path, ...args]);
      if (path === 'to/a') {
        throw error;
      } else if (path === 'to/b') {
        throw Object.assign(new Error('exists'), { code: 'EEXIST' });
      }
    });

    await copyTemplate('from', 'to', localOnError);

    expect(localOnError).toHaveBeenCalledTimes(1);
    expect(localOnError).toHaveBeenLastCalledWith(error);
    expect(written.sort((a, b) => a[0].localeCompare(b[0]))).toMatchInlineSnapshot(`
      Array [
        Array [
          "to/a",
          "(input-1)",
          Object {
            "flag": "wx",
          },
        ],
        Array [
          "to/b",
          "(input-1)",
          Object {
            "flag": "wx",
          },
        ],
      ]
    `);
  });

  test('built-in prompts', async () => {
    new Date().getFullYear();
    files.set('from/a', '{{{&template}}} {{{&target}}} {{{&year}}} {{{&name}}} {{{&email}}}');

    await copyTemplate('from.foo', 'to.bar', onError);

    expect(getInput).toHaveBeenCalledTimes(0);
    expect(written.sort((a, b) => a[0].localeCompare(b[0]))).toMatchInlineSnapshot(`
      Array [
        Array [
          "from/a",
          "from to 2022 John john@email.com",
          Object {
            "flag": "wx",
          },
        ],
      ]
    `);
  });

  test('alternative built-in prompts', async () => {
    new Date().getFullYear();
    files.set(
      'from/a',
      '~~~template.basename~~~ ~~~target.basename~~~ ~~~date.year~~~ ~~~git.user.name~~~ ~~~git.user.email~~~',
    );

    await copyTemplate('from.foo', 'to.bar', onError);

    expect(getInput).toHaveBeenCalledTimes(0);
    expect(written.sort((a, b) => a[0].localeCompare(b[0]))).toMatchInlineSnapshot(`
      Array [
        Array [
          "from/a",
          "from to 2022 John john@email.com",
          Object {
            "flag": "wx",
          },
        ],
      ]
    `);
  });
});
