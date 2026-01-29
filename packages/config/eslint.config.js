// @ts-check
import { createBaseConfig } from './eslint/base.js';

export default [
  ...createBaseConfig(import.meta.dirname),

  // Disable strict type-checking rules for ESLint config files
  // These files use dynamic plugin APIs that don't have complete type definitions
  {
    files: ['eslint/**/*.js'],
    rules: {
      '@typescript-eslint/no-deprecated': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
];
