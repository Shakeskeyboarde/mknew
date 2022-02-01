import { isPathExistsError } from './isPathExistsError';

describe('isPathExistsError', () => {
  test('true', () => {
    expect(isPathExistsError(Object.assign(Error(), { code: 'EEXIST' }))).toBe(true);
  });

  test('false', () => {
    expect(isPathExistsError({ code: 'EEXIST' })).toBe(false);
    expect(isPathExistsError(Object.assign(Error(), { code: 'ENOENT' }))).toBe(false);
    expect(isPathExistsError(Error())).toBe(false);
  });
});
