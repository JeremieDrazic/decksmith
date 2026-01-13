// @ts-check
import globals from 'globals';

import { createBaseConfig } from './base.js';

/** @param {string} tsconfigRootDir */
export function createNodeConfig(tsconfigRootDir) {
  return [
    ...createBaseConfig(tsconfigRootDir),

    // Node globals
    {
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
    },
  ];
}
