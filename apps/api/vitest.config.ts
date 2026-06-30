import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '@decksmith/config/vitest/base';

export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      alias: {
        // Mirror the TypeScript path alias so @/ works in test files too
        '@/': new URL('src/', import.meta.url).pathname,
      },
    },
    test: {
      include: ['src/**/*.test.ts'],
      coverage: {
        include: ['src/**/*.ts'],
        exclude: ['src/index.ts'],
        thresholds: {
          lines: 60,
          functions: 60,
          branches: 60,
          statements: 60,
        },
      },
    },
  })
);
