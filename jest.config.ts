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
    '^@qimenjs/async$': '<rootDir>/src/async',
    '^@qimenjs/base$': '<rootDir>/src/base',
    '^@qimenjs/core$': '<rootDir>/src/core',
    '^@qimenjs/error$': '<rootDir>/src/error',
    '^@qimenjs/logger$': '<rootDir>/src/logger',
    '^@qimenjs/runtime-env$': '<rootDir>/src/runtime-env',
    '^@qimenjs/runtime$': '<rootDir>/src/runtime',
    '^@qimenjs/validation$': '<rootDir>/src/validation',
    '^@qimenjs/utils$': '<rootDir>/src/utils',
    '^@qimenjs/tasks$': '<rootDir>/src/tasks',
    '^@qimenjs/task$': '<rootDir>/src/task',
    '^@qimenjs/crypto$': '<rootDir>/src/crypto',
    '^@qimenjs/kernel$': '<rootDir>/src/kernel',
    '^@qimenjs/registry$': '<rootDir>/src/registry',
    '^@qimenjs/presets$': '<rootDir>/src/presets',
    '^@qimenjs/schema$': '<rootDir>/src/schema',
    '^@qimenjs/context$': '<rootDir>/src/context',
    '^@qimenjs/cache$': '<rootDir>/src/cache',
    '^@qimenjs/pipeline$': '<rootDir>/src/pipeline',
    '^@qimenjs/composable$': '<rootDir>/src/composable',
    '^@qimenjs/data-processor$': '<rootDir>/src/data-processor',
    '^@qimenjs/mime$': '<rootDir>/src/mime',
    '^@qimenjs/pattern$': '<rootDir>/src/pattern',
    '^@qimenjs/oauth2$': '<rootDir>/src/oauth2',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 10000
};

export default config;
