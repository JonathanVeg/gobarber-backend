module.exports = {
    env: {
        es6: true,
        node: true,
    },
    extends: ['airbnb-base'],
    // plugins: ["prettier"],
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
        // "prettier/prettier": "error",
        'class-methods-use-this': 'off',
        'no-param-reassign': 'off',
        // camelcase: 'off',
        'no-unused-vars': [
            'error',
            {
                argsIgnorePattern: 'next',
            },
        ],
    },
};
