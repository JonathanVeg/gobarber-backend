module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ['airbnb-base'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2],
    'no-multiple-empty-lines': [1, { max: 1 }],
    'class-methods-use-this': 'off',
    'no-param-reassign': 'off',
    'comma-dangle': [
      'error',
      {
        arrays: 'never',
        objects: 'always',
      },
    ],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: 'next',
      },
    ],
  },
};
