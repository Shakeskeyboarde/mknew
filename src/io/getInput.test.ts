import EventEmitter from 'node:events';
import readline from 'node:readline';
import chalk from 'chalk';
import { getInput } from './getInput';

class MockReadline extends EventEmitter {
  question = jest.fn<void, [message: string, callback: (value: string) => void]>();
  close = jest.fn();
}

jest.mock('node:readline', () => {
  return {
    createInterface: jest.fn(),
  };
});

describe('getInput', () => {
  const createInterfaceMock = readline.createInterface as jest.Mock;
  let readlineMock: MockReadline;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    readlineMock = new MockReadline();
    createInterfaceMock.mockReturnValue(readlineMock);
    logSpy = jest.spyOn(console, 'log').mockReturnValue();
  });

  test('simple prompt', async () => {
    readlineMock.question.mockImplementationOnce((_, cb) => cb('foo'));
    expect(await getInput('hello')).toBe('foo');
    expect(readlineMock.question).toHaveBeenCalledWith(chalk.bold('hello: '), expect.any(Function));
    expect(readlineMock.close).toHaveBeenCalledTimes(1);
  });

  test('trimmed prompt', async () => {
    readlineMock.question.mockImplementationOnce((_, cb) => cb('foo'));
    expect(await getInput('  hello  ')).toBe('foo');
    expect(readlineMock.question).toHaveBeenCalledWith(chalk.bold('hello: '), expect.any(Function));
    expect(readlineMock.close).toHaveBeenCalledTimes(1);
  });

  test('custom punctuation', async () => {
    readlineMock.question.mockImplementationOnce((_, cb) => cb('foo'));
    expect(await getInput('hello?')).toBe('foo');
    expect(readlineMock.question).toHaveBeenCalledWith(chalk.bold('hello? '), expect.any(Function));
    expect(readlineMock.close).toHaveBeenCalledTimes(1);
  });

  test('interrupt', async () => {
    const promise = getInput('hello');
    expect(readlineMock.question).toHaveBeenCalledWith(chalk.bold('hello: '), expect.any(Function));
    readlineMock.emit('SIGINT');
    expect(promise).rejects.toMatchInlineSnapshot(`[InputInterruptError: Interrupted]`);
    expect(readlineMock.close).toHaveBeenCalledTimes(1);
  });
});
