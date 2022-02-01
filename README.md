# Make New

Stupidly simple scaffolding.

## Usage

Recursively copy a template. Empty directories are skipped. If a file or directory error occurs, the resource is skipped and the rest of the template will still be copied.

```bash
npx mknew [-s <source>] [-w <workspace>] <template> <target>
```

### Options

- `-s <source>`
  - The `<template>` path is relative to this directory, or to the Git repo root if a Git URL is given.
  - Git URLs can have a `#<commit>` suffix to indicate a branch or other ref.
  - Git repos are "sparse cloned" (`<template>` sub-directory only) to a local temp directory, which is deleted after copying the template files.
- `-w <workspace>`
  - The `<target>` path is relative to this directory.

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
