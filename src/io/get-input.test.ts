import chalk from 'chalk';
import NodeEvents from 'node:events';
import nodeReadline from 'node:readline';

import { getInput } from './get-input';

// eslint-disable-next-line functional/no-class
class MockReadline extends NodeEvents {
  // eslint-disable-next-line functional/prefer-readonly-type
  readonly question = jest.fn<void, [message: string, callback: (value: string) => void]>();
  readonly close = jest.fn();
}

jest.mock('node:readline', () => {
  return {
    createInterface: jest.fn(),
  };
});

describe('getInput', () => {
  const createInterfaceMock = nodeReadline.createInterface as jest.Mock;
  let readlineMock: MockReadline;
  // let logSpy: jest.SpyInstance;

  beforeEach(() => {
    readlineMock = new MockReadline();
    createInterfaceMock.mockReturnValue(readlineMock);
    // logSpy = jest.spyOn(console, 'log').mockReturnValue();
  });

  test('simple prompt', async () => {
    readlineMock.question.mockImplementationOnce((_, callback) => callback('foo'));
    expect(await getInput('hello')).toBe('foo');
    expect(readlineMock.question).toHaveBeenCalledWith(chalk.bold('hello: '), expect.any(Function));
    expect(readlineMock.close).toHaveBeenCalledTimes(1);
  });

  test('trimmed prompt', async () => {
    readlineMock.question.mockImplementationOnce((_, callback) => callback('foo'));
    expect(await getInput('  hello  ')).toBe('foo');
    expect(readlineMock.question).toHaveBeenCalledWith(chalk.bold('hello: '), expect.any(Function));
    expect(readlineMock.close).toHaveBeenCalledTimes(1);
  });

  test('custom punctuation', async () => {
    readlineMock.question.mockImplementationOnce((_, callback) => callback('foo'));
    expect(await getInput('hello?')).toBe('foo');
    expect(readlineMock.question).toHaveBeenCalledWith(chalk.bold('hello? '), expect.any(Function));
    expect(readlineMock.close).toHaveBeenCalledTimes(1);
  });

  test('interrupt', async () => {
    const promise = getInput('hello');
    expect(readlineMock.question).toHaveBeenCalledWith(chalk.bold('hello: '), expect.any(Function));
    readlineMock.emit('SIGINT');
    void expect(promise).rejects.toMatchInlineSnapshot(`[InputInterruptError: Interrupted]`);
    expect(readlineMock.close).toHaveBeenCalledTimes(1);
  });
});
