/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  rootDir: 'src',
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  restoreMocks: true,
  resetMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['**/*.ts'],
  coverageDirectory: '../out/coverage',
  coverageReporters: ['text-summary', 'html'],
  coverageThreshold: {
    global: { statements: 75, branches: 70, function: 60, lines: 75 },
  },
};
