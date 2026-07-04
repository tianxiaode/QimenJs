import type { Config } from 'jest';

const config = {
  preset: 'ts-jest',
  collectCoverage: true,
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/test'],
  testMatch: [
    '<rootDir>/test/unit/**/*.test.ts',
    '<rootDir>/test/integration/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@orbit-js/async$': '<rootDir>/src/async',
    '^@orbit-js/base$': '<rootDir>/src/base',
    '^@orbit-js/core$': '<rootDir>/src/core',
    '^@orbit-js/error$': '<rootDir>/src/error',
    '^@orbit-js/logger$': '<rootDir>/src/logger',
    '^@orbit-js/runtime-env$': '<rootDir>/src/runtime-env',
    '^@orbit-js/runtime$': '<rootDir>/src/runtime',
    '^@orbit-js/validation$': '<rootDir>/src/validation',
    '^@orbit-js/utils$': '<rootDir>/src/utils',
    '^@orbit-js/tasks$': '<rootDir>/src/tasks',
    '^@orbit-js/task$': '<rootDir>/src/task',
    '^@orbit-js/crypto$': '<rootDir>/src/crypto',
    '^@orbit-js/kernel$': '<rootDir>/src/kernel',
    '^@orbit-js/registry$': '<rootDir>/src/registry',
    '^@orbit-js/presets$': '<rootDir>/src/presets',
    '^@orbit-js/schema$': '<rootDir>/src/schema',
    '^@orbit-js/context$': '<rootDir>/src/context',
    '^@orbit-js/cache$': '<rootDir>/src/cache',
    '^@orbit-js/pipeline$': '<rootDir>/src/pipeline',
    '^@orbit-js/composable$': '<rootDir>/src/composable',
    '^@orbit-js/data-processor$': '<rootDir>/src/data-processor',
    '^@orbit-js/mime$': '<rootDir>/src/mime',
    '^@orbit-js/pattern$': '<rootDir>/src/pattern',
    '^@orbit-js/oauth2$': '<rootDir>/src/oauth2',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 10000
};

export default config;
