import type { Decorator, Preview } from '@storybook/react-vite';

import { withThemeByClassName } from '@storybook/addon-themes';

import './preview.css';

// withThemeByClassName applies .dark via useEffect — axe-core may scan before it fires.
// This decorator applies the class synchronously during render so it's present immediately.
const withSyncTheme: Decorator = (Story, context) => {
  const isDark = (context.globals['theme'] ?? 'dark') === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  return <Story />;
};

const preview: Preview = {
  decorators: [
    withSyncTheme,
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
