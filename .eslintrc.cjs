module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
      }
    },
    {
      files: ['backend/**/*.js'],
      env: { node: true },
      parserOptions: { ecmaVersion: 2021 },
      rules: {
        // Cho phép dùng require trong backend CommonJS
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ],
  settings: { react: { version: 'detect' } },
  plugins: ['react'],
  rules: {
    'react/prop-types': 'off',
    'no-console': ['warn', { allow: ['error', 'warn', 'info'] }]
  },
  ignorePatterns: ['dist', 'build', 'node_modules']
};
