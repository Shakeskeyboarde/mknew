import { printUsage } from './printUsage';

describe('printUsage', () => {
  const logs: unknown[] = [];
  const errors: unknown[] = [];

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation((...args) => {
      logs.push(args);
    });
    jest.spyOn(console, 'error').mockImplementation((...args) => {
      errors.push(args);
    });
  });

  afterEach(() => {
    logs.length = 0;
    errors.length = 0;
    process.exitCode = 0;
  });

  test('error', () => {
    printUsage('foo');
    expect(logs).toMatchInlineSnapshot(`
Array [
  Array [
    "Usage: tcopy <template> <target> [options]
       tcopy --help

Copy a template directory or file, replacing all template placeholders.
Existing files will not be overwritten.

Options:
  -s, --source <value>      Templates directory or Git repo (Default: '.')
  -w, --workspace <value>   Target root directory (Default: '.')
  --help                    Print this help text
",
  ],
]
`);
    expect(errors).toMatchInlineSnapshot(`
Array [
  Array [
    "[91mfoo[39m",
  ],
]
`);
    expect(process.exitCode).toBe(2);
  });

  test('no error', () => {
    printUsage();
    expect(logs).toMatchInlineSnapshot(`
Array [
  Array [
    "Usage: tcopy <template> <target> [options]
       tcopy --help

Copy a template directory or file, replacing all template placeholders.
Existing files will not be overwritten.

Options:
  -s, --source <value>      Templates directory or Git repo (Default: '.')
  -w, --workspace <value>   Target root directory (Default: '.')
  --help                    Print this help text
",
  ],
]
`);
    expect(errors).toMatchInlineSnapshot(`Array []`);
    expect(process.exitCode).toBe(0);
  });
});
