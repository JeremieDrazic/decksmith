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
    <div className="inline-grid grid-cols-[auto_auto] items-center gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-muted">default</span>
      <Tag tone="default">Default</Tag>
      <span className="font-mono text-xs text-text-muted">accent</span>
      <Tag tone="accent">Accent</Tag>
      <span className="font-mono text-xs text-text-muted">success</span>
      <Tag tone="success">Success</Tag>
      <span className="font-mono text-xs text-text-muted">warning</span>
      <Tag tone="warning">Warning</Tag>
      <span className="font-mono text-xs text-text-muted">error</span>
      <Tag tone="error">Error</Tag>
      <span className="font-mono text-xs text-text-muted">info</span>
      <Tag tone="info">Info</Tag>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-muted">sm</span>
      <Tag size="sm">Small</Tag>
      <span className="font-mono text-xs text-text-muted">md</span>
      <Tag size="md">Medium</Tag>
    </div>
  ),
};

export const Dismissible: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-muted">default</span>
      <Tag tone="default" onDismiss={noop} dismissLabel="Remove Default tag">
        Default
      </Tag>
      <span className="font-mono text-xs text-text-muted">accent</span>
      <Tag tone="accent" onDismiss={noop} dismissLabel="Remove Accent tag">
        Accent
      </Tag>
      <span className="font-mono text-xs text-text-muted">success</span>
      <Tag tone="success" onDismiss={noop} dismissLabel="Remove Success tag">
        Success
      </Tag>
      <span className="font-mono text-xs text-text-muted">warning</span>
      <Tag tone="warning" onDismiss={noop} dismissLabel="Remove Warning tag">
        Warning
      </Tag>
      <span className="font-mono text-xs text-text-muted">error</span>
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
