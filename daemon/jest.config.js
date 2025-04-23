export default{
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    "/node_modules/",  // Ignore files in node_modules
    "/dist/",           // Ignore compiled files in the dist directory
  ],
  testPathIgnorePatterns: [
    "/tests/",          // Ignore the entire tests directory from being picked up as test files
    "/.*/test.*/",      // Ignore any directories or files matching the test pattern
    "/ts-examples/",
  ],
};
