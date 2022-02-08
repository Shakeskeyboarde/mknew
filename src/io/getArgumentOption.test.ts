import { getArgumentOption } from './getArgumentOption';

describe('getArgumentOption', () => {
  test('no flags', () => {
    expect(getArgumentOption(['--foo', 'f', '--bar=b'])).toBe(undefined);
  });

  test('no match', () => {
    expect(getArgumentOption(['--foo', 'f', '--bar=b'], '--baz')).toBe(undefined);
  });

  test('match', () => {
    expect(getArgumentOption(['--foo', 'f', '--bar=b'], '--foo')).toBe('f');
    expect(getArgumentOption(['--foo', 'f', '--bar=b'], '--foo', '--bar')).toBe('f');
    expect(getArgumentOption(['--foo', 'f', '--bar=b'], '--bar', '--foo')).toBe('b');
  });

  test('throw', () => {
    expect(() => {
      getArgumentOption(['--foo'], '--foo');
    }).toThrow();
    expect(() => {
      getArgumentOption(['--foo', '--bar'], '--foo');
    }).toThrow();
  });
});
