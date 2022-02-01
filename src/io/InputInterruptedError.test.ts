import { InputInterruptError } from './InputInterruptError';

describe('InputInterruptedError', () => {
  test('props', () => {
    const error = new InputInterruptError();

    expect(error.name).toMatchInlineSnapshot(`"InputInterruptError"`);
    expect(error.message).toMatchInlineSnapshot(`"Interrupted"`);
    expect(error.toString()).toBe(error.message);
  });
});
