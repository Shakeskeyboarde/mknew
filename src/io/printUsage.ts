import { printError } from './printError';

/**
 * Print the usage text to stdout.
 */
export function printUsage() {
  console.log(
    `
Usage: tcopy <template> <target> [options]
       tcopy --help

Copy a template directory or file, replacing all template placeholders.
Existing files will not be overwritten.

Options:
  -s, --source <value>      Templates directory or Git repo (Default: '.')
  -w, --workspace <value>   Target root directory (Default: '.')
  --help                    Print this help text
    `.trim() + '\n',
  );
}
