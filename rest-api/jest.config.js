module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // This tells Jest to transform .js or .jsx files using babel
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',  // Handle relative imports
  },
};
