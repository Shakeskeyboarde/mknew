import { printWarning } from './print-warning';

describe('printWarning', () => {
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
    printWarning('message');
    expect(process.exitCode).toBe(1);
    expect(messages).toMatchInlineSnapshot(`
Array [
  Array [
    "[93mmessage[39m",
  ],
]
`);
  });

  test('Error', () => {
    printWarning(new Error('message'));
    expect(messages).toMatchInlineSnapshot(`
Array [
  Array [
    "[93mError: message[39m",
  ],
]
`);
  });

  test('toString', () => {
    printWarning({ toString: () => 'message' });
    expect(messages).toMatchInlineSnapshot(`
Array [
  Array [
    "[93mmessage[39m",
  ],
]
`);
  });
});
