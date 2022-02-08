import nodeFs from 'node:fs/promises';
import { parseGitSource } from './git/parseGitSource';
import { cloneGitRepo } from './git/cloneGitRepo';
import { printUsage } from './io/printUsage';
import { copyTemplate } from './template/copyTemplate';
import { main } from './main';
import { getArgumentOption } from './io/getArgumentOption';
import { printError } from '.';

jest.mock('node:fs/promises', () => ({ rm: jest.fn() }));
jest.mock('./io/getArgumentOption', () => ({ getArgumentOption: jest.fn() }));
jest.mock('./io/printUsage', () => ({ printUsage: jest.fn() }));
jest.mock('./io/printError', () => ({ printError: jest.fn() }));
jest.mock('./io/printWarning', () => ({ printWarning: jest.fn() }));
jest.mock('./git/parseGitSource', () => ({ parseGitSource: jest.fn() }));
jest.mock('./git/cloneGitRepo', () => ({ cloneGitRepo: jest.fn() }));
jest.mock('./template/copyTemplate', () => ({ copyTemplate: jest.fn() }));

describe('main', () => {
  beforeEach(() => {
    (parseGitSource as jest.Mock).mockReturnValue(null);
  });

  test('help', async () => {
    await main(['--help']);
    expect(printUsage).toHaveBeenCalledTimes(1);
    expect(printUsage).toHaveBeenLastCalledWith();
  });

  test('missing template', async () => {
    await main([]);
    expect(printUsage).toHaveBeenCalled();
    expect(printError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/template/) }));
  });

  test('missing target', async () => {
    await main(['template']);
    expect(printUsage).toHaveBeenCalled();
    expect(printError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/target/) }));
  });

  test('local', async () => {
    await main(['template', 'target']);
    expect(cloneGitRepo).not.toHaveBeenCalled();
    expect(nodeFs.rm).not.toHaveBeenCalled();
    expect(copyTemplate).toHaveBeenCalledWith('template', 'target', expect.any(Function));
  });

  test('local with source and workspace', async () => {
    (getArgumentOption as jest.Mock).mockReturnValueOnce('foo').mockReturnValueOnce('bar');
    await main(['template', 'target']);
    expect(copyTemplate).toHaveBeenCalledWith('foo/template', 'bar/target', expect.any(Function));
  });

  test('repo', async () => {
    const source = { url: 'foo', path: 'bar', branch: 'baz' };
    (parseGitSource as jest.Mock).mockReturnValueOnce(source);
    (cloneGitRepo as jest.Mock).mockResolvedValueOnce('temp');
    await main(['template', 'target']);
    expect(cloneGitRepo).toHaveBeenCalledWith(source, 'template');
    expect(nodeFs.rm).toHaveBeenCalledWith('temp', expect.objectContaining({ recursive: true, force: true }));
    expect(copyTemplate).toHaveBeenCalledWith('temp/bar/template', 'target', expect.any(Function));
  });

  test('throw', async () => {
    const error = Error();
    const source = { url: 'foo', path: 'bar', branch: 'baz' };
    (parseGitSource as jest.Mock).mockReturnValueOnce(source);
    (cloneGitRepo as jest.Mock).mockResolvedValueOnce('temp');
    (copyTemplate as jest.Mock).mockRejectedValue(error);
    await main(['template', 'target']);
    expect(cloneGitRepo).toHaveBeenCalledWith(source, 'template');
    expect(copyTemplate).toHaveBeenCalledWith('temp/bar/template', 'target', expect.any(Function));
    expect(printError).toHaveBeenCalledWith(error);
    expect(nodeFs.rm).toHaveBeenCalledWith('temp', expect.objectContaining({ recursive: true, force: true }));
  });
});
