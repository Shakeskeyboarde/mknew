/**
 * Get the value of a command line option. The option argument(s) will be
 * removed from the args array.
 */
export function getArgumentOption(args: string[], ...options: string[]): string | undefined {
  while (options.length) {
    const flag = options.shift()!;
    const index = args.findIndex(
      (value) => value.startsWith(flag) && (value.length === flag.length || value[flag.length] === '='),
    );

    if (index >= 0) {
      const option = args[index];

      if (option.length > flag.length) {
        args.splice(index, 1);
        return option.slice(flag.length + 1);
      }

      if (index >= args.length - 1 || args[index + 1].startsWith('-')) {
        throw Error(`Option "${option}" requires a value`);
      }

      return args.splice(index, 2)[1];
    }
  }
}
