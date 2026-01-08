// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default tseslint.config(
  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,

  // Prettier integration: disable formatting rules that conflict with Prettier
  prettierConfig,

  // Global ignores (don't lint these directories)
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.turbo/**',
      'coverage/**',
      'storybook-static/**',
      '*.config.js',
      '*.config.ts',
    ],
  },

  // Custom rules
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Run Prettier as an ESLint rule (shows formatting issues as lint errors)
      'prettier/prettier': 'error',

      // Allow unused variables prefixed with _ (common pattern for ignoring parameters)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  }
);
