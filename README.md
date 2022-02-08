# Make New (mknew)

Stupidly simple scaffolding.

Recursively copy a template file or directory. Input prompts are displayed when placeholders are found in text files (eg. `{{{placeholder}}}`), and the entered value is used as a literal replacement (no escaping). Empty directories and Git ignored paths are skipped.

## Usage

```bash
npx mknew [-s <source>] [-w <workspace>] <template> <target>
```

### Options

- `-s <source>`
  - Directory or Git URL. The `<template>` path is relative to the source.
- `-w <workspace>`
  - Directory. The `<target>` path is relative to the workspace.

## Templates

A template can be a single file or a whole directory. Directories are copied recursively.

Any text file can contain template placeholders, which are "prompt" strings surrounded by triple curly braces (eg. `{{{prompt}}}`). The first time a unique template placeholder is encountered, the user will be prompted to enter a value. All placeholders will be replaced in copied text files.

Example: `templates/foo/data.json`

```json
{
  "value": "{{{Enter a value}}}"
}
```

Run `mknew`, and enter values when prompted.

```bash
$ npx mknew templates/foo packages/bar
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

### Built-in Placeholders

There are some special built-in placeholders which are replaced with generated values. The user is not prompted for these values.

- `{{{&template}}}`
  - The basename (without extension) of the template path
- `{{{&target}}}`
  - The basename (without extension) of the target path

## Git Sources

If the source (`-s` option) is a Git URL, then the repository will be [sparse cloned](https://git-scm.com/docs/git-sparse-checkout) using the Git CLI, into a temporary directory which is deleted before the process exits.

Supported Git URL protocols are: `ssh`, `git`, `git+ssh`, `https`, `http`, and `file`. The [scp-like](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols) syntax is also supported (eg. `user@server:project.git`).

Git URLs can have a `#<commit>` suffix to indicate a branch or other ref.

If the URL contains a `.git` extension, then any part of the path that follows it is considered to be a sub-directory of the repository (eg. `ssh://foo.com/bar.git/sub/directory`).

## Why?

File and directory templates should be extremely simple to setup and modify. Ideally, they should be copied from something that works, with the parts marked that need to be updated on reuse. And this is exactly what `mknew` allows. There are no configuration files, escaped values, or template branch conditions. It's just a shortcut for cut, paste, and replace.
