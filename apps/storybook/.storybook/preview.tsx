import type { Preview } from '@storybook/react-vite';

import { withThemeByClassName } from '@storybook/addon-themes';

import './preview.css';

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: { dark: 'dark', light: '' },
      defaultTheme: 'dark',
      parentSelector: 'html',
    }),
  ],
  parameters: {
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Design System', 'Components', '*'],
      },
    },
  },
};

export default preview;
