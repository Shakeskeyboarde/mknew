/**
 * Get the value of a command line option. The option argument(s) will be
 * removed from the args array. If the option given more than once, the last
 * one wins.
 */
export function getArgumentOption(args: string[], ...options: string[]): string | undefined {
  let value: string | undefined;

  function next(): boolean {
    const index = args.findIndex((arg) =>
      options.some((option) => arg.startsWith(option) && (arg.length === option.length || arg[option.length] === '=')),
    );

    if (index < 0) {
      return false;
    }

    const option = args[index];
    const equalIndex = option.indexOf('=');

    if (equalIndex >= 0) {
      args.splice(index, 1);
      value = option.slice(equalIndex + 1);
      return true;
    }

    if (index >= args.length - 1 || args[index + 1].startsWith('-')) {
      throw Error(`Option "${option}" requires a value`);
    }

    value = args.splice(index, 2)[1];

    return true;
  }

  while (next());

  return value;
}
