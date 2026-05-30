import type { Config } from 'jest';

const config: Config = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: './tsconfig.test.json' }],
      },
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
      testMatch: [
        '<rootDir>/src/test/unit/api/**/*.test.ts',
        '<rootDir>/src/test/unit/utils/**/*.test.ts',
      ],
      clearMocks: true,
      restoreMocks: true,
    },
    {
      displayName: 'components',
      testEnvironment: 'jest-environment-jsdom',
      setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: './tsconfig.test.json' }],
      },
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
      testMatch: [
        '<rootDir>/src/test/components/**/*.test.tsx',
        '<rootDir>/src/test/unit/store/**/*.test.ts',
      ],
      clearMocks: true,
      restoreMocks: true,
    },
  ],
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/db/seed.ts',
    '!scripts/**',
  ],
};

export default config;
