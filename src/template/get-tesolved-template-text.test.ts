import { getResolvedTemplateText } from './get-resolved-template-text';

describe('getResolvedTemplateText', () => {
  test('at start', async () => {
    expect(await getResolvedTemplateText('{{{foo}}} bar', async () => 'a')).toMatchInlineSnapshot(`"a bar"`);
  });

  test('at end', async () => {
    expect(await getResolvedTemplateText('bar {{{foo}}}', async () => 'a')).toMatchInlineSnapshot(`"bar a"`);
  });

  test('in middle', async () => {
    expect(await getResolvedTemplateText('bar {{{foo}}} baz', async () => 'a')).toMatchInlineSnapshot(`"bar a baz"`);
  });

  test('all', async () => {
    expect(
      await getResolvedTemplateText('a{{{b}}}{{{c}}}de{{{f}}}g', async (id) => `(${id.toUpperCase()})`),
    ).toMatchInlineSnapshot(`"a(B)(C)de(F)g"`);
  });

  test('not newline', async () => {
    expect(
      await getResolvedTemplateText(
        `a{{{b
}}}{{{c}}}d`,
        async (id) => id.toUpperCase(),
      ),
    ).toMatchInlineSnapshot(`
"a{{{b
}}}Cd"
`);
  });

  test('not empty', async () => {
    expect(await getResolvedTemplateText('a{{{}}}{{{b}}}c', async (id) => id.toUpperCase())).toMatchInlineSnapshot(
      `"a{{{}}}Bc"`,
    );
  });

  test('tildes', async () => {
    expect(await getResolvedTemplateText('@foo/~~~.bar~~~.baz', async (id) => id.toUpperCase())).toMatchInlineSnapshot(
      `"@foo/.BAR.baz"`,
    );
  });
});
