export function getArg(args: string[], ...flags: string[]): string | undefined {
  while (flags.length) {
    const flag = flags.shift()!;
    const index = args.findIndex(
      (value) => value.startsWith(flag) && (value.length === flag.length || value[flag.length] === '='),
    );

    if (index >= 0) {
      const value = args[index];

      if (value.length > flag.length) {
        args.splice(index, 1);
        return value.slice(flag.length + 1);
      }

      return args.splice(index, 2)[1];
    }
  }
}
