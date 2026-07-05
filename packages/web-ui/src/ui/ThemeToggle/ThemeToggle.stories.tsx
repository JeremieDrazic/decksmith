import type { Meta, StoryObj } from '@storybook/react-vite';

import { ThemeProvider } from '../../hooks/use-theme';
import { Field, FieldLabel } from '../Field/Field';
import { ThemeToggle } from './ThemeToggle';

const meta = {
  title: 'Components/UI/ThemeToggle',
  component: ThemeToggle,
  parameters: { layout: 'padded', controls: { disable: true } },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <Field orientation="horizontal" className="w-fit">
      <FieldLabel variant="body" htmlFor="theme-toggle-playground">
        Dark mode
      </FieldLabel>
      <ThemeToggle id="theme-toggle-playground" aria-label="Dark mode" {...args} />
    </Field>
  ),
};

// ─── Standalone ───────────────────────────────────────────────────────────────

export const Standalone: Story = {
  render: () => <ThemeToggle aria-label="Dark mode" />,
};
