import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '@decksmith/web-ui';

import '../i18n';
import { ThemeControl } from './ThemeControl';

const meta = {
  title: 'Components/App/ThemeControl',
  component: ThemeControl,
  parameters: { layout: 'centered', controls: { disable: true } },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ThemeControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
