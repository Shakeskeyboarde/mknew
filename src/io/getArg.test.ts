import { getArg } from './getArg';

describe('getArg', () => {
  test('no flags', () => {
    expect(getArg(['--foo', 'f', '--bar=b'])).toBe(undefined);
  });

  test('no match', () => {
    expect(getArg(['--foo', 'f', '--bar=b'], '--baz')).toBe(undefined);
  });

  test('match', () => {
    expect(getArg(['--foo', 'f', '--bar=b'], '--foo')).toBe('f');
    expect(getArg(['--foo', 'f', '--bar=b'], '--foo', '--bar')).toBe('f');
    expect(getArg(['--foo', 'f', '--bar=b'], '--bar', '--foo')).toBe('b');
  });
});
