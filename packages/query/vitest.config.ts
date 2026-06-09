import { mergeConfig, defineConfig } from 'vitest/config';
import baseConfig from '@decksmith/config/vitest/base';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      setupFiles: ['@decksmith/test-utils/server'],
    },
  })
);
