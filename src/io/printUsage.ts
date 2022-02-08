import { printError } from './printError';

/**
 * Print the usage text to stdout.
 */
export function printUsage() {
  console.log(
    `
Usage: mknew <template> <target> [options]
       mknew --version
       mknew --help

Copy a template directory or file, replacing all template placeholders.
Existing files will not be overwritten.

Options:
  -s, --source <value>      Templates directory or Git repo (Default: '.')
  -w, --workspace <value>   Target root directory (Default: '.')
  --version                 Print the current version
  --help                    Print this help text
    `.trim() + '\n',
  );
}
