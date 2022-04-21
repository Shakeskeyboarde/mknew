import { printUsage } from './print-usage';

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

  test('no error', () => {
    printUsage();
    expect(logs.join('\n')).toMatch('Usage: mknew');
    expect(errors).toMatchInlineSnapshot(`Array []`);
  });
});
