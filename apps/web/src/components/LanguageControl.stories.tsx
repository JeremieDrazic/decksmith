import type { Meta, StoryObj } from '@storybook/react-vite';

import '../i18n';
import { LanguageControl } from './LanguageControl';

const meta = {
  title: 'Components/App/LanguageControl',
  component: LanguageControl,
  parameters: { layout: 'centered', controls: { disable: true } },
} satisfies Meta<typeof LanguageControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
