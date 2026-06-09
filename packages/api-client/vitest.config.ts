import { mergeConfig, defineConfig } from 'vitest/config';
import baseConfig from '@decksmith/config/vitest/base';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['src/**/*.test.ts'],
    },
  })
);
