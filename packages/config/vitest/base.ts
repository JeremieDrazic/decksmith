import { defineConfig } from 'vitest/config';

/**
 * Shared Vitest base configuration for all Decksmith packages.
 *
 * Usage (per-package vitest.config.ts):
 *   import { mergeConfig } from 'vitest/config';
 *   import baseConfig from '@decksmith/config/vitest/base';
 *   export default mergeConfig(baseConfig, defineConfig({ test: { ... } }));
 */
export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
