import nodeFs from 'node:fs/promises';

import { getGitIgnored } from '../git/get-git-ignored';
import { getFiles } from './get-files';

jest.mock('node:fs/promises', () => ({ readdir: jest.fn(), stat: jest.fn() }));

jest.mock('../git/getGitIgnored', () => ({ getGitIgnored: jest.fn() }));

const toArrayFromAsyncGen = async <T>(generator: AsyncGenerator<T>): Promise<T[]> => {
  const values: T[] = [];

  for await (const value of generator) {
    values.push(value);
  }

  return values;
};

describe('getFilenames', () => {
  const statMock = nodeFs.stat as jest.Mock;
  const readdirMock = nodeFs.readdir as jest.Mock;
  const getIgnoredMock = getGitIgnored as jest.Mock;

  beforeEach(() => {
    statMock.mockResolvedValue({ isDirectory: () => true });
    readdirMock.mockResolvedValue([]);
    getIgnoredMock.mockResolvedValue([]);
  });

  test('files only', async () => {
    readdirMock.mockResolvedValueOnce([
      { isDirectory: () => false, name: 'a' },
      { isDirectory: () => false, name: 'b' },
      { isDirectory: () => false, name: 'c' },
    ]);
    expect(await toArrayFromAsyncGen(getFiles('root'))).toMatchInlineSnapshot(`
Array [
  "a",
  "b",
  "c",
]
`);
  });

  test('files first', async () => {
    readdirMock
      .mockResolvedValueOnce([
        { isDirectory: () => false, name: 'a' },
        { isDirectory: () => true, name: 'b' },
        { isDirectory: () => false, name: 'c' },
      ])
      .mockResolvedValueOnce([{ isDirectory: () => false, name: 'd' }]);
    expect(await toArrayFromAsyncGen(getFiles('root'))).toMatchInlineSnapshot(`
Array [
  "a",
  "c",
  "b/d",
]
`);
  });

  test('nested', async () => {
    readdirMock
      .mockResolvedValueOnce([
        { isDirectory: () => false, name: 'a' },
        { isDirectory: () => true, name: 'b' },
        { isDirectory: () => true, name: 'c' },
      ])
      .mockResolvedValueOnce([
        { isDirectory: () => true, name: 'd' },
        { isDirectory: () => false, name: 'e' },
      ])
      .mockResolvedValueOnce([{ isDirectory: () => false, name: 'f' }])
      .mockResolvedValueOnce([{ isDirectory: () => false, name: 'g' }]);
    expect(await toArrayFromAsyncGen(getFiles('root'))).toMatchInlineSnapshot(`
Array [
  "a",
  "b/e",
  "b/d/f",
  "c/g",
]
`);
  });

  test('file', async () => {
    statMock.mockResolvedValue({ isDirectory: () => false });
    expect(await toArrayFromAsyncGen(getFiles('root'))).toMatchInlineSnapshot(`
Array [
  ".",
]
`);
  });
});
