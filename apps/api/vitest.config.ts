import { mergeConfig, defineConfig } from 'vitest/config';
import baseConfig from '@decksmith/config/vitest/base';

export default mergeConfig(
  baseConfig,
  defineConfig({
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
