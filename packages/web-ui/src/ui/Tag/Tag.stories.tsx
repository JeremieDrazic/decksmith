import type { Meta, StoryObj } from '@storybook/react-vite';
import { noop } from '@decksmith/utils';

import { Tag } from './Tag';

const meta = {
  title: 'Components/UI/Tag',
  component: Tag,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: {
    children: 'Competitive',
    tone: 'default',
    size: 'md',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['default', 'accent', 'success', 'warning', 'error', 'info'],
    },
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { onDismiss: noop, dismissLabel: 'Remove Competitive tag' },
  parameters: { controls: { disable: false } },
};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag tone="default">Default</Tag>
      <Tag tone="accent">Accent</Tag>
      <Tag tone="success">Success</Tag>
      <Tag tone="warning">Warning</Tag>
      <Tag tone="error">Error</Tag>
      <Tag tone="info">Info</Tag>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag size="sm">Small</Tag>
      <Tag size="md">Medium</Tag>
    </div>
  ),
};

export const Dismissible: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag tone="default" onDismiss={noop} dismissLabel="Remove Default tag">
        Default
      </Tag>
      <Tag tone="accent" onDismiss={noop} dismissLabel="Remove Accent tag">
        Accent
      </Tag>
      <Tag tone="success" onDismiss={noop} dismissLabel="Remove Success tag">
        Success
      </Tag>
      <Tag tone="warning" onDismiss={noop} dismissLabel="Remove Warning tag">
        Warning
      </Tag>
      <Tag tone="error" onDismiss={noop} dismissLabel="Remove Error tag">
        Error
      </Tag>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-sm font-mono mr-2">Collection tags</span>
        <Tag tone="accent" onDismiss={noop} dismissLabel="Remove Foil tag">
          Foil
        </Tag>
        <Tag tone="default" onDismiss={noop} dismissLabel="Remove Signed tag">
          Signed
        </Tag>
        <Tag tone="success" onDismiss={noop} dismissLabel="Remove NM tag">
          NM
        </Tag>
        <Tag tone="warning" onDismiss={noop} dismissLabel="Remove SP tag">
          SP
        </Tag>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-sm font-mono mr-2">Static labels</span>
        <Tag size="sm" tone="info">
          cEDH
        </Tag>
        <Tag size="sm" tone="accent">
          Competitive
        </Tag>
        <Tag size="sm">Budget</Tag>
      </div>
    </div>
  ),
};
