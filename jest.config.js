/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  rootDir: 'src',
  // preset: 'ts-jest',
  preset: 'ts-jest/presets/js-with-ts',
  transformIgnorePatterns: ['/node_modules/(?!(execa)/)', '\\.pnp\\.[^\\/]+$'],
  testEnvironment: 'node',
  verbose: true,
  restoreMocks: true,
  resetMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['**/*.ts'],
  coverageDirectory: '../out/coverage',
  coverageReporters: ['text-summary', 'html'],
  coverageThreshold: {
    global: { statements: 40, branches: 40, function: 40, lines: 40 },
  },
};
