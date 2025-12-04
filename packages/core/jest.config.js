const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  displayName: 'core',
  rootDir: path.join(__dirname),
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: [
    '<rootDir>/test/unit/**/*.test.ts',
    '<rootDir>/test/integration/**/*.test.ts'
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/**/__tests__/**'
  ],
  coverageDirectory: '<rootDir>/coverage',
  testEnvironment: 'node', // 默认使用 node 环境
  testEnvironmentOptions: {
    // 自定义环境选项
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1' // 路径别名，方便导入
  },
  // 针对特定文件使用不同的测试环境
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['**/*.test.ts'],
      // 排除需要浏览器环境的测试
      testPathIgnorePatterns: ['browser\\.test\\.ts$']
    },
    {
      displayName: 'browser',
      testEnvironment: 'jsdom',
      testMatch: ['**/browser.test.ts']
    }
  ]
};