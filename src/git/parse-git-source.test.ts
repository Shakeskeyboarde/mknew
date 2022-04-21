import { parseGitSource } from './parse-git-source';

describe('parseGitSource', () => {
  const cases: [string, { branch?: string; url: string } | null][] = [
    // Simple
    ['https://github.com/facebook/react.git', { url: 'https://github.com/facebook/react.git' }],
    ['https://github.com/facebook/react', { url: 'https://github.com/facebook/react' }],
    ['http://github.com/facebook/react.git', { url: 'http://github.com/facebook/react.git' }],
    ['http://github.com/facebook/react', { url: 'http://github.com/facebook/react' }],
    ['git://github.com/facebook/react.git', { url: 'git://github.com/facebook/react.git' }],
    ['git://github.com/facebook/react', { url: 'git://github.com/facebook/react' }],
    ['ssh://github.com/facebook/react.git', { url: 'ssh://github.com/facebook/react.git' }],
    ['ssh://github.com/facebook/react', { url: 'ssh://github.com/facebook/react' }],
    ['git+ssh://github.com/facebook/react.git', { url: 'git+ssh://github.com/facebook/react.git' }],
    ['git+ssh://github.com/facebook/react', { url: 'git+ssh://github.com/facebook/react' }],
    ['git@github.com:facebook/react.git', { url: 'git@github.com:facebook/react.git' }],
    ['git@github.com:facebook/react', { url: 'git@github.com:facebook/react' }],
    // With branch
    ['https://github.com/facebook/react.git#foo', { branch: 'foo', url: 'https://github.com/facebook/react.git' }],
    ['https://github.com/facebook/react#foo', { branch: 'foo', url: 'https://github.com/facebook/react' }],
    ['http://github.com/facebook/react.git#foo', { branch: 'foo', url: 'http://github.com/facebook/react.git' }],
    ['http://github.com/facebook/react#foo', { branch: 'foo', url: 'http://github.com/facebook/react' }],
    ['git://github.com/facebook/react.git#foo', { branch: 'foo', url: 'git://github.com/facebook/react.git' }],
    ['git://github.com/facebook/react#foo', { branch: 'foo', url: 'git://github.com/facebook/react' }],
    ['ssh://github.com/facebook/react.git#foo', { branch: 'foo', url: 'ssh://github.com/facebook/react.git' }],
    ['ssh://github.com/facebook/react#foo', { branch: 'foo', url: 'ssh://github.com/facebook/react' }],
    ['git+ssh://github.com/facebook/react.git#foo', { branch: 'foo', url: 'git+ssh://github.com/facebook/react.git' }],
    ['git+ssh://github.com/facebook/react#foo', { branch: 'foo', url: 'git+ssh://github.com/facebook/react' }],
    ['git@github.com:facebook/react.git#foo', { branch: 'foo', url: 'git@github.com:facebook/react.git' }],
    ['git@github.com:facebook/react#foo', { branch: 'foo', url: 'git@github.com:facebook/react' }],
    // Not Git URLs
    ['foo', null],
    ['foo/bar', null],
    ['./foo/bar', null],
    ['/foo/bar', null],
    ['.\\foo', null],
    ['C:\\foo', null],
    ['foo:bar', null],
    ['foo:/bar', null],
  ];

  for (const [url, result] of cases) {
    test(url, () => {
      expect(parseGitSource(url)).toEqual(result);
    });
  }
});
