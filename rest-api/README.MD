How to run the jest tests
========================

## If you want to run unit tests with the provided skeleton, use these commands

1. Ensure that jest is installed: npm install --save-dev jest supertest

2. Ensure that babel is installed: npm install --save-dev babel-jest @babel/preset-env

3. Ensure package.json has the script:
{
    "type": "module",
    "scripts": {
        "test": "node --experimental-vm-modules jest"
    },
    "devDependencies": {
        "@babel/preset-env": "^7.26.9",
        "babel-jest": "^29.7.0",,
        "jest": "^29.7.0"
    },
    "babel": {
        "presets": [
            "@babel/preset-env"
        ]
    }
}

4. Create a jest.config.js if not already created and add the script:
export default {
    transform: {
      '^.+\\.jsx?$': 'babel-jest', // This tells Jest to transform .js or .jsx files using babel
    },
    testEnvironment: 'node',
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',  // Handle relative imports
    },
  };

5. Use the command: "npm test" or "npx jest" to run all tests in the api_login.tests