// @ts-check
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

import { createBaseConfig } from './base.js';

/** @param {string} tsconfigRootDir */
export function createReactConfig(tsconfigRootDir) {
  return [
    ...createBaseConfig(tsconfigRootDir),

    // React recommended
    reactPlugin.configs.flat.recommended,
    reactPlugin.configs.flat['jsx-runtime'],

    // React Hooks
    {
      plugins: {
        'react-hooks': reactHooksPlugin,
      },
      rules: reactHooksPlugin.configs.recommended.rules,
    },

    // Accessibility
    jsxA11yPlugin.flatConfigs.recommended,

    // Browser globals + React settings
    {
      languageOptions: {
        globals: {
          ...globals.browser,
        },
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
  ];
}
