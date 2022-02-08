import nodeFs from 'node:fs/promises';
import { getGitIgnored } from '../git/getGitIgnored';
import { getFiles } from './getFiles';

jest.mock('node:fs/promises', () => ({ stat: jest.fn(), readdir: jest.fn() }));

jest.mock('../git/getGitIgnored', () => ({ getGitIgnored: jest.fn() }));

async function toArrayFromAsyncGen<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const values: T[] = [];

  for await (const value of generator) {
    values.push(value);
  }

  return values;
}

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
      { name: 'a', isDirectory: () => false },
      { name: 'b', isDirectory: () => false },
      { name: 'c', isDirectory: () => false },
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
        { name: 'a', isDirectory: () => false },
        { name: 'b', isDirectory: () => true },
        { name: 'c', isDirectory: () => false },
      ])
      .mockResolvedValueOnce([{ name: 'd', isDirectory: () => false }]);
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
        { name: 'a', isDirectory: () => false },
        { name: 'b', isDirectory: () => true },
        { name: 'c', isDirectory: () => true },
      ])
      .mockResolvedValueOnce([
        { name: 'd', isDirectory: () => true },
        { name: 'e', isDirectory: () => false },
      ])
      .mockResolvedValueOnce([{ name: 'f', isDirectory: () => false }])
      .mockResolvedValueOnce([{ name: 'g', isDirectory: () => false }]);
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
