import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import unicornPlugin from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

/** @param {string} tsconfigRootDir */
export function createBaseConfig(tsconfigRootDir) {
  return defineConfig(
    // Base ESLint
    eslint.configs.recommended,

    // TypeScript strict with type-checking
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,

    // Unicorn (modern best practices)
    unicornPlugin.configs['flat/recommended'],

    // Prettier (must be near last)
    prettierConfig,

    // Global ignores
    {
      ignores: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.turbo/**',
        'coverage/**',
        'eslint.config.js',
      ],
    },

    // Parser options for type-checked rules
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
    },

    // Import plugin
    {
      plugins: {
        import: importPlugin,
      },
      rules: {
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            'newlines-between': 'always',
            alphabetize: { order: 'asc', caseInsensitive: true },
          },
        ],
        'import/no-duplicates': 'error',
        'import/no-cycle': 'error',
        'import/no-self-import': 'error',
      },
    },

    // Custom rules
    {
      plugins: {
        prettier: prettierPlugin,
      },
      rules: {
        'prettier/prettier': 'error',

        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],

        // Prefer type aliases over interfaces
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

        // Unicorn overrides
        'unicorn/prevent-abbreviations': 'off',
        'unicorn/no-null': 'off',
        'unicorn/filename-case': [
          'error',
          {
            cases: {
              kebabCase: true,
              pascalCase: true,
            },
          },
        ],
      },
    }
  );
}
