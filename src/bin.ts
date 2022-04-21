#!/usr/bin/env node

/* istanbul ignore file */

void Promise.resolve()
  .then(async () => {
    if (process.env.NODE_ENV === 'development') {
      try {
        // eslint-disable-next-line import/no-extraneous-dependencies
        await import('source-map-support/register');
      } catch {
        // The source-map-support dependency is optional, and only installed
        // in development.
      }
    }

    return undefined;
  })
  .then(async () => import('./main'))
  .then(async ({ main }) => main());
