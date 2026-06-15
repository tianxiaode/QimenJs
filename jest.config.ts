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
  coverageReporters: ['text', 'html', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@orbitjs/async$': '<rootDir>/src/async',
    '^@orbitjs/base$': '<rootDir>/src/base',
    '^@orbitjs/core$': '<rootDir>/src/core',
    '^@orbitjs/error$': '<rootDir>/src/error',
    '^@orbitjs/logger$': '<rootDir>/src/logger',
    '^@orbitjs/runtime-env$': '<rootDir>/src/runtime-env',
    '^@orbitjs/runtime$': '<rootDir>/src/runtime',
    '^@orbitjs/validation$': '<rootDir>/src/validation',
    '^@orbitjs/utils$': '<rootDir>/src/utils',
    '^@orbitjs/tasks$': '<rootDir>/src/tasks',
    '^@orbitjs/task$': '<rootDir>/src/task',
    '^@orbitjs/crypto$': '<rootDir>/src/crypto',
    '^@orbitjs/kernel$': '<rootDir>/src/kernel',
    '^@orbitjs/registry$': '<rootDir>/src/registry',
    '^@orbitjs/presets$': '<rootDir>/src/presets',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 10000
};

export default config;
