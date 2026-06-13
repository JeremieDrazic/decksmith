import type { Meta, StoryObj } from '@storybook/react-vite';

import { Toggle } from './Toggle';

const BoldIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 8h5a2.5 2.5 0 000-5H4v5zm0 0h5.5a2.5 2.5 0 010 5H4V8z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const ItalicIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 3H6M10 13H6M9 3L7 13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const UnderlineIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 13h8M5 3v5a3 3 0 006 0V3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const meta = {
  title: 'Components/UI/Toggle',
  component: Toggle,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: {
    variant: 'ghost',
    size: 'md',
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { children: 'Commander', defaultPressed: false },
  parameters: { controls: { disable: false } },
  argTypes: {
    variant: { control: 'select', options: ['ghost', 'secondary'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    defaultPressed: { control: 'boolean' },
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex flex-col gap-2">
        <p className="text-text-muted text-xs font-mono">ghost</p>
        <div className="flex gap-2">
          <Toggle variant="ghost">Unpressed</Toggle>
          <Toggle variant="ghost" defaultPressed>
            Pressed
          </Toggle>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-text-muted text-xs font-mono">secondary</p>
        <div className="flex gap-2">
          <Toggle variant="secondary">Unpressed</Toggle>
          <Toggle variant="secondary" defaultPressed>
            Pressed
          </Toggle>
        </div>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <Toggle size="xs">xs</Toggle>
      <Toggle size="sm">sm</Toggle>
      <Toggle size="md">md</Toggle>
      <Toggle size="lg">lg</Toggle>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Toggle aria-label="Bold">
          <BoldIcon />
        </Toggle>
        <Toggle aria-label="Italic">
          <ItalicIcon />
        </Toggle>
        <Toggle aria-label="Underline">
          <UnderlineIcon />
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="secondary" defaultPressed aria-label="Bold">
          <BoldIcon />
        </Toggle>
        <Toggle variant="secondary" aria-label="Italic">
          <ItalicIcon />
        </Toggle>
        <Toggle variant="secondary" aria-label="Underline">
          <UnderlineIcon />
        </Toggle>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Toggle disabled>Ghost</Toggle>
      <Toggle variant="secondary" disabled>
        Secondary
      </Toggle>
      <Toggle defaultPressed disabled>
        Pressed disabled
      </Toggle>
    </div>
  ),
};
