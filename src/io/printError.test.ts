import { printError } from './printError';

describe('printError', () => {
  const messages: unknown[] = [];

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation((...args: unknown[]): void => {
      messages.push(args);
    });
  });

  afterEach(() => {
    messages.length = 0;
    process.exitCode = 0;
  });

  test('string', () => {
    printError('message');
    expect(process.exitCode).toBe(2);
    expect(messages).toMatchInlineSnapshot(`
Array [
  Array [
    "[91mmessage[39m",
  ],
]
`);
  });

  test('Error', () => {
    printError(Error('message'));
    expect(messages).toMatchInlineSnapshot(`
Array [
  Array [
    "[91mError: message[39m",
  ],
]
`);
  });

  test('toString', () => {
    printError({ toString: () => 'message' });
    expect(messages).toMatchInlineSnapshot(`
Array [
  Array [
    "[91mmessage[39m",
  ],
]
`);
  });
});
