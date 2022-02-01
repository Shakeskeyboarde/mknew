import fs from 'node:fs/promises';
import { isExistingPath } from './isExistingPath';

jest.mock('node:fs/promises');

describe('isExistingPath', () => {
  test('true', async () => {
    (fs.stat as jest.Mock).mockResolvedValue(undefined);
    expect(await isExistingPath('foo')).toBe(true);
  });

  test('false', async () => {
    (fs.stat as jest.Mock).mockRejectedValue(undefined);
    expect(await isExistingPath('foo')).toBe(false);
  });
});
