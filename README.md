# Make New (mknew)

Stupidly simple scaffolding.

Recursively copy a template file or directory. Input prompts are displayed when placeholders are found in text files (eg. `{{{placeholder}}}` or `~~~placeholder~~~`), and the entered value is used as a literal replacement (no escaping). Empty directories and Git ignored paths are skipped.

**Try it out** by creating an SPA (single page application) using the following one-liner.

```bash
npx mknew -s https://github.com/Shakeskeyboarde/templates.git spa ./spa-demo
```

## Usage

```bash
npx mknew [-s <source>] [-w <workspace>] <template> <target>
```

### Options

- `-s <source>`
  - Directory path or Git URL.
  - The `<template>` path is relative to the source.
  - Default: `.`
- `-w <workspace>`
  - Directory path.
  - The `<target>` path is relative to the workspace.
  - Default: `.`

**Note:** If the `-s` or `-w` options are used more than once, the last one wins. This is to allow shell aliases or a `package.json` scripts to set default values which can be overridden.

### Environment Variables

- `MKNEW_SOURCE`
  - Default source (`-s`) value if none is given.
- `MKNEW_WORKSPACE`
  - Default workspace (`-w`) value if none is given.

## Templates

A template can be a single file or a whole directory. Directories are copied recursively.

Any text file can contain template placeholders, which are "prompt" strings surrounded by triple curly braces or triple tildes (eg. `{{{prompt}}}` or `~~~prompt~~~`). The first time a unique template placeholder is encountered, the user will be prompted to enter a value. All placeholders will be replaced in copied text files.

Example: `templates/foo/data.json`

```json
{
  "value": "{{{Enter a value}}}"
}
```

Run `mknew`, and enter values when prompted.

```bash
$ npx mknew templates/foo packages/bar
Copying "templates/foo"
Enter a value: abc_
Created "packages/bar"
$ _
```

And now `packages/bar/data.json` exists, and contains the following content.

```json
{
  "value": "abc"
}
```

Values are used as entered, without any escaping.

### Built-in Prompts

There are some special built-in prompts which are replaced with generated values. The user is not actually prompted for these values.

- `{{{template.basename}}}`
  - The basename (without extension) of the template path
- `{{{target.basename}}}`
  - The basename (without extension) of the target path
- `{{{date.year}}}`
  - The current year (4-digit, local).
- `{{{git.user.name}}}`
  - The Git config `user.name` value.
- `{{{git.user.email}}}`
  - The Git config `user.email` value.

These also work with tilde markers, for example: `~~~git.user.email~~~`

## Git Sources

If the source (`-s` option) is a Git URL, then the repository will be [sparse cloned](https://git-scm.com/docs/git-sparse-checkout) (using the Git CLI) into a temporary directory, which will be deleted before the process exits.

Supported Git URL protocols are: `ssh`, `git`, `git+ssh`, `https`, `http`, and `file`. The [scp-like](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols) syntax is also supported (eg. `user@server:project.git`).

Git URLs can have a `#<commit>` suffix to indicate a branch or other ref.

If the URL contains a `.git` extension, then any part of the path that follows it is considered to be a sub-directory of the repository (eg. `ssh://foo.com/bar.git/sub/directory`).

## Why?

File and directory templates should be extremely simple to setup and modify. Ideally, they should be copied from something that works, with the parts marked that need to be updated on reuse. And this is exactly what `mknew` allows. There are no configuration files, escaped values, or template branch conditions. It's just a shortcut for: copy, paste, find and replace.
