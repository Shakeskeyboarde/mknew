import fs from 'node:fs/promises';
import { isText } from 'istextorbinary';
import { isExistingPath } from '../filesystem/isExistingPath';
import { getFilenames } from '../filesystem/getFilenames';
import { getInput } from '../io/getInput';
import { getTemplatePlaceholders } from './getTemplatePlaceholders';
import { getResolvedTemplateText } from './getResolvedTemplateText';
import { applyTemplate } from './copyTemplate';

jest.mock('node:fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  copyFile: jest.fn(),
  mkdir: jest.fn(),
}));
jest.mock('istextorbinary', () => ({
  isText: jest.fn(),
}));
jest.mock('../filesystem/getFilenames', () => ({
  getFilenames: jest.fn(),
}));
jest.mock('../filesystem/isExistingPath', () => ({
  isExistingPath: jest.fn(),
}));
jest.mock('../io/getInput', () => ({
  getInput: jest.fn(),
}));
jest.mock('./getTemplatePlaceholders', () => ({
  getTemplatePlaceholders: jest.fn(),
}));
jest.mock('./getResolvedTemplateText', () => ({
  getResolvedTemplateText: jest.fn(),
}));

describe('applyTemplate', () => {
  let filenames: string[] = [];

  let traverses: unknown[] = [];
  let finds: unknown[] = [];
  let prompts: unknown[] = [];
  let written: unknown[] = [];
  let copied: unknown[] = [];
  let mkdirs: unknown[] = [];
  let errors: unknown[] = [];
  let replaceCount = 0;

  const onError = (error: unknown) => {
    errors.push(error);
  };

  beforeEach(() => {
    (fs.readFile as jest.Mock).mockImplementation(async (pathname, options) => {
      const text = `read:${pathname}`;
      return options === 'utf-8' ? text : Buffer.from(text, 'utf-8');
    });
    (fs.writeFile as jest.Mock).mockImplementation(async (...args) => {
      written.push(args);
    });
    (fs.copyFile as jest.Mock).mockImplementation(async (...args) => {
      copied.push(args);
    });
    (fs.mkdir as jest.Mock).mockImplementation(async (...args) => {
      mkdirs.push(args);
    });
    (isText as jest.Mock).mockReturnValue(true);
    (getFilenames as jest.Mock).mockImplementation(async function* (...args): AsyncGenerator {
      for (const filename of filenames) {
        yield filename;
      }

      traverses.push(args);
    });
    (isExistingPath as jest.Mock).mockResolvedValue(false);
    (getTemplatePlaceholders as jest.Mock).mockImplementation(function* (...args) {
      for (let i = 0; i < 3; ++i) {
        yield { key: `${i + finds.length}` };
      }

      finds.push(args);
    });
    (getInput as jest.Mock).mockImplementation(async function (message) {
      prompts.push([message]);
      return `getInput:${message}`;
    });
    (getResolvedTemplateText as jest.Mock).mockImplementation(async function (
      text,
      getReplacement: (key: string) => Promise<string>,
    ) {
      const values: string[] = [];

      for (let i = 0; i < 3; ++i) {
        values.push(await getReplacement(`${i + replaceCount}`));
      }

      replaceCount += 1;

      return `replace:${text},${values.join(',')}`;
    });
  });

  afterEach(() => {
    filenames = [];
    traverses = [];
    finds = [];
    prompts = [];
    written = [];
    copied = [];
    mkdirs = [];
    errors = [];
    replaceCount = 0;
  });

  test('empty directory', async () => {
    await applyTemplate('from', 'to', onError);

    expect(traverses).toMatchInlineSnapshot(`
Array [
  Array [
    "from",
  ],
]
`);
    expect(finds).toMatchInlineSnapshot(`Array []`);
    expect(prompts).toMatchInlineSnapshot(`Array []`);
    expect(written).toMatchInlineSnapshot(`Array []`);
    expect(copied).toMatchInlineSnapshot(`Array []`);
    expect(mkdirs).toMatchInlineSnapshot(`Array []`);
    expect(errors).toMatchInlineSnapshot(`Array []`);
  });

  test('no errors', async () => {
    filenames.push('a', 'b', 'c', 'd/a', 'd/b/a', 'e/a', 'e/b', 'f');
    (isText as jest.Mock).mockImplementation((pathname) => pathname !== 'from/d/a');
    (isExistingPath as jest.Mock).mockImplementation((pathname) => pathname === 'to/b');

    await applyTemplate('from', 'to', onError);

    expect(traverses).toMatchInlineSnapshot(`
Array [
  Array [
    "from",
  ],
]
`);
    expect(finds).toMatchInlineSnapshot(`
Array [
  Array [
    "read:from/a",
  ],
  Array [
    "read:from/c",
  ],
  Array [
    "read:from/d/b/a",
  ],
  Array [
    "read:from/e/a",
  ],
  Array [
    "read:from/e/b",
  ],
  Array [
    "read:from/f",
  ],
]
`);
    expect(prompts).toMatchInlineSnapshot(`
Array [
  Array [
    "0",
  ],
  Array [
    "1",
  ],
  Array [
    "2",
  ],
  Array [
    "3",
  ],
  Array [
    "4",
  ],
  Array [
    "5",
  ],
  Array [
    "6",
  ],
  Array [
    "7",
  ],
]
`);
    expect(written).toMatchInlineSnapshot(`
Array [
  Array [
    "to/a",
    "replace:read:from/a,getInput:0,getInput:1,getInput:2",
    Object {
      "flag": "wx",
    },
  ],
  Array [
    "to/c",
    "replace:read:from/c,getInput:1,getInput:2,getInput:3",
    Object {
      "flag": "wx",
    },
  ],
  Array [
    "to/d/b/a",
    "replace:read:from/d/b/a,getInput:2,getInput:3,getInput:4",
    Object {
      "flag": "wx",
    },
  ],
  Array [
    "to/e/a",
    "replace:read:from/e/a,getInput:3,getInput:4,getInput:5",
    Object {
      "flag": "wx",
    },
  ],
  Array [
    "to/e/b",
    "replace:read:from/e/b,getInput:4,getInput:5,getInput:6",
    Object {
      "flag": "wx",
    },
  ],
  Array [
    "to/f",
    "replace:read:from/f,getInput:5,getInput:6,getInput:7",
    Object {
      "flag": "wx",
    },
  ],
]
`);
    expect(copied).toMatchInlineSnapshot(`
Array [
  Array [
    "from/d/a",
    "to/d/a",
    1,
  ],
]
`);
    expect(mkdirs).toMatchInlineSnapshot(`
Array [
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
    "to/d/b",
    Object {
      "recursive": true,
    },
  ],
  Array [
    "to/e",
    Object {
      "recursive": true,
    },
  ],
]
`);
    expect(errors).toMatchInlineSnapshot(`Array []`);
  });

  test('create directory error', async () => {
    filenames.push('a', 'b/a', 'b/b', 'c');
    const error = Error();
    (fs.mkdir as jest.Mock).mockImplementation(async (path, ...args) => {
      mkdirs.push([path, ...args]);

      if (path === 'to/b') {
        throw error;
      }
    });
    const onError = jest.fn();

    await applyTemplate('from', 'to', onError);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenLastCalledWith(error);
    expect(written).toMatchInlineSnapshot(`
Array [
  Array [
    "to/a",
    "replace:read:from/a,getInput:0,getInput:1,getInput:2",
    Object {
      "flag": "wx",
    },
  ],
  Array [
    "to/c",
    "replace:read:from/c,getInput:1,getInput:2,getInput:3",
    Object {
      "flag": "wx",
    },
  ],
]
`);
    expect(mkdirs).toMatchInlineSnapshot(`
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
]
`);
  });

  test('write file error', async () => {
    filenames.push('a', 'b');
    const onError = jest.fn();
    const error = Error();
    (fs.writeFile as jest.Mock).mockImplementation(async (filename, ...args) => {
      written.push([filename, ...args]);
      if (filename === 'to/a') {
        throw error;
      } else if (filename === 'to/b') {
        throw Object.assign(Error('exists'), { code: 'EEXIST' });
      }
    });

    await applyTemplate('from', 'to', onError);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenLastCalledWith(error);
    expect(written).toMatchInlineSnapshot(`
Array [
  Array [
    "to/a",
    "replace:read:from/a,getInput:0,getInput:1,getInput:2",
    Object {
      "flag": "wx",
    },
  ],
  Array [
    "to/b",
    "replace:read:from/b,getInput:1,getInput:2,getInput:3",
    Object {
      "flag": "wx",
    },
  ],
]
`);
  });

  test('built-in prompts', async () => {
    filenames.push('a');
    (getTemplatePlaceholders as jest.Mock).mockImplementation(function* (...args) {
      yield { key: '&template' };
      yield { key: '&target' };
    });
    (getResolvedTemplateText as jest.Mock).mockImplementation(async function (text, getReplacement) {
      expect(await getReplacement('&template')).toBe('from');
      expect(await getReplacement('&target')).toBe('to');
      return text;
    });

    await applyTemplate('from.foo', 'to.bar', onError);

    expect(getInput).toHaveBeenCalledTimes(0);
    expect(getResolvedTemplateText).toHaveBeenCalledTimes(1);
  });
});
