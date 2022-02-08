import nodeFs from 'node:fs/promises';
import { isExistingPath } from './isExistingPath';

jest.mock('node:fs/promises');

describe('isExistingPath', () => {
  test('true', async () => {
    (nodeFs.stat as jest.Mock).mockResolvedValue({});
    await expect(isExistingPath('foo')).resolves.toBe(true);
  });

  test('false', async () => {
    (nodeFs.stat as jest.Mock).mockRejectedValue(Object.assign(Error(), { code: 'ENOENT' }));
    await expect(isExistingPath('foo')).resolves.toBe(false);
  });

  test('throw', async () => {
    (nodeFs.stat as jest.Mock).mockRejectedValue(Object.assign(Error()));
    await expect(isExistingPath('foo')).rejects.toBeInstanceOf(Error);
  });
});
