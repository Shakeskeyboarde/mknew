import nodeOs from 'node:os';

export type ConcurrencyOptions = {
  readonly concurrency?: number;
  readonly onError?: (error: unknown) => Promise<void>;
};

/**
 * Run all async task functions with limited concurrency.
 *
 * Default concurrency is CPU count + 1.
 */
export const runTasks = async (
  tasks: readonly (() => Promise<void>)[],
  {
    concurrency = nodeOs.cpus().length + 1,
    onError = async (error) => {
      throw error;
    },
  }: ConcurrencyOptions = {},
): Promise<void> => {
  const active = new Set<Promise<void>>();

  concurrency = Math.max(1, Math.ceil(concurrency));

  for (const task of tasks) {
    const promise = task().catch(onError);

    active.add(promise);

    void promise.then(() => active.delete(promise));

    if (active.size >= concurrency) {
      await Promise.any([...active]);
    }
  }

  await Promise.all([...active]);
};
