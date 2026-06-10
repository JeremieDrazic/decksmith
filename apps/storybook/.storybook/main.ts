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
    '../../../packages/web-ui/src/typography/**/*.stories.@(ts|tsx)',
    '../../web/src/**/*.mdx',
    '../../web/src/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  viteFinal: (viteConfig) => {
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(tailwindcss());
    return viteConfig;
  },
};

export default config;
