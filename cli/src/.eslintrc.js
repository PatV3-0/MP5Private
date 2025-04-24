// filepath: c:\Users\smart\Documents\BSC IKS\Year 3\COS301\clidev\MP5Private\cli\src\.eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json', // Add this line
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  env: {
    node: true,
    es2021: true,
  },
  rules: {
    // Add custom rules here if needed
  },
};