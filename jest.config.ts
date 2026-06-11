import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          // Allow importing path aliases in tests
          paths: { '@/*': ['./src/*'] },
        },
      },
    ],
  },
  testMatch: ['**/__tests__/unit/**/*.test.ts', '**/__tests__/unit/**/*.test.tsx'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/lib/**/*.ts', 'src/hooks/**/*.ts'],
};

export default config;
