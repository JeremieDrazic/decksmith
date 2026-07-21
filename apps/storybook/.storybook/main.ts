import type { StorybookConfig } from '@storybook/react-vite';

import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
    {
      directory: '../../../packages/web-ui/src/design-system',
      titlePrefix: 'Design System',
      files: '**/*.stories.@(ts|tsx)',
    },
    '../../../packages/web-ui/src/!(design-system)/**/*.stories.@(ts|tsx)',
    '../../web/src/**/*.mdx',
    '../../web/src/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  viteFinal: (viteConfig) => {
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(tailwindcss());
    // Dual packages (@decksmith/domain, …) expose a "source" export condition pointing at their
    // TS source alongside the compiled "import" → dist. Storybook never builds those packages, so
    // resolve them from source; without this, Vite hits the dist entry (absent) and fails.
    viteConfig.resolve ??= {};
    viteConfig.resolve.conditions = ['source', 'module', 'browser', 'development|production'];
    return viteConfig;
  },
};

export default config;
