import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './Input';

const meta = {
  title: 'Components/UI/Input',
  component: Input,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: { placeholder: 'Search cards…' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'search', 'url'] },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
};

export const Types: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-72">
      <Input type="text" placeholder="Deck name" />
      <Input type="email" placeholder="you@example.com" />
      <Input type="password" placeholder="Password" />
      <Input type="number" placeholder="0" />
      <Input type="search" placeholder="Search cards…" />
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-72">
      <Input type="text" aria-invalid aria-describedby="name-error" defaultValue="@invalid!" />
      <p id="name-error" className="text-xs text-error-text">
        Deck name can only contain letters, numbers, and spaces.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Atraxa Commander',
  },
};
