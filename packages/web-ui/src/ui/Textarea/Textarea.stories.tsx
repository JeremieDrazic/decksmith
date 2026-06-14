import type { Meta, StoryObj } from '@storybook/react-vite';

import { Textarea } from './Textarea';

const meta = {
  title: 'Components/UI/Textarea',
  component: Textarea,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: { placeholder: 'Describe your deck strategy…' },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
};

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue:
      'Fast aggro with a Goblin tribal shell. Prioritize haste enablers in the opening hand. Sideboard heavy against control.',
  },
};

export const AutoSizing: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-80">
      <p className="text-text-muted text-xs font-mono">
        field-sizing-content — grows with content, no scrollbar
      </p>
      <Textarea placeholder="Start typing to see auto-resize…" />
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-80">
      <Textarea
        aria-invalid
        aria-describedby="notes-error"
        placeholder="Required"
        defaultValue=""
      />
      <p id="notes-error" className="text-xs text-error-text">
        Strategy notes are required before saving.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'This deck description is locked.',
  },
};
