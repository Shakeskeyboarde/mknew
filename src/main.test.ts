import nodeFs from 'node:fs/promises';

import { printError } from '.';
import { cloneGitRepo } from './git/clone-git-repo';
import { parseGitSource } from './git/parse-git-source';
import { printUsage } from './io/print-usage';
import { main } from './main';
import { copyTemplate } from './template/copy-template';

jest.mock('node:fs/promises', () => ({ rm: jest.fn() }));
jest.mock('./io/printUsage', () => ({ printUsage: jest.fn() }));
jest.mock('./io/printError', () => ({ printError: jest.fn() }));
jest.mock('./io/printWarning', () => ({ printWarning: jest.fn() }));
jest.mock('./git/parseGitSource', () => ({ parseGitSource: jest.fn() }));
jest.mock('./git/cloneGitRepo', () => ({ cloneGitRepo: jest.fn() }));
jest.mock('./template/copyTemplate', () => ({ copyTemplate: jest.fn() }));

describe('main', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockReturnValue();
    jest.spyOn(console, 'error').mockReturnValue();
    (parseGitSource as jest.Mock).mockReturnValue(null);
  });

  test('help', async () => {
    await main(['--help']);
    expect(printUsage).toHaveBeenCalledTimes(1);
    expect(printUsage).toHaveBeenLastCalledWith();
  });

  test('missing template', async () => {
    await main([]);
    expect(printError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/template/) }));
  });

  test('missing target', async () => {
    await main(['template']);
    expect(printError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/target/) }));
  });

  test('local', async () => {
    await main(['template', 'target']);
    expect(cloneGitRepo).not.toHaveBeenCalled();
    expect(nodeFs.rm).not.toHaveBeenCalled();
    expect(copyTemplate).toHaveBeenCalledWith('template', 'target', expect.any(Function));
  });

  test('local with source and workspace', async () => {
    await main(['-s', 'foo', '-w', 'bar', 'template', 'target']);
    expect(copyTemplate).toHaveBeenCalledWith('foo/template', 'bar/target', expect.any(Function));
  });

  test('repo', async () => {
    const source = { branch: 'baz', path: 'bar', url: 'foo' };
    (parseGitSource as jest.Mock).mockReturnValueOnce(source);
    (cloneGitRepo as jest.Mock).mockResolvedValueOnce('temp');
    await main(['template', 'target']);
    expect(cloneGitRepo).toHaveBeenCalledWith(source, 'template');
    expect(nodeFs.rm).toHaveBeenCalledWith('temp', expect.objectContaining({ force: true, recursive: true }));
    expect(copyTemplate).toHaveBeenCalledWith('temp/bar/template', 'target', expect.any(Function));
  });

  test('throw', async () => {
    const error = new Error('error');
    const source = { branch: 'baz', path: 'bar', url: 'foo' };
    (parseGitSource as jest.Mock).mockReturnValueOnce(source);
    (cloneGitRepo as jest.Mock).mockResolvedValueOnce('temp');
    (copyTemplate as jest.Mock).mockRejectedValue(error);
    await main(['template', 'target']);
    expect(cloneGitRepo).toHaveBeenCalledWith(source, 'template');
    expect(copyTemplate).toHaveBeenCalledWith('temp/bar/template', 'target', expect.any(Function));
    expect(printError).toHaveBeenCalledWith(error);
    expect(nodeFs.rm).toHaveBeenCalledWith('temp', expect.objectContaining({ force: true, recursive: true }));
  });
});
