import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './Badge';

const meta = {
  title: 'Components/UI/Badge',
  component: Badge,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: {
    children: 'Commander',
    tone: 'default',
    size: 'md',
    dot: false,
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['default', 'accent', 'success', 'warning', 'error', 'info'],
    },
    size: { control: 'select', options: ['sm', 'md'] },
    dot: { control: 'boolean' },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: { controls: { disable: false } },
};

export const Tones: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-faint">default</span>
      <Badge tone="default">Default</Badge>
      <span className="font-mono text-xs text-text-faint">accent</span>
      <Badge tone="accent">Accent</Badge>
      <span className="font-mono text-xs text-text-faint">success</span>
      <Badge tone="success">Success</Badge>
      <span className="font-mono text-xs text-text-faint">warning</span>
      <Badge tone="warning">Warning</Badge>
      <span className="font-mono text-xs text-text-faint">error</span>
      <Badge tone="error">Error</Badge>
      <span className="font-mono text-xs text-text-faint">info</span>
      <Badge tone="info">Info</Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-faint">sm</span>
      <Badge size="sm">Small</Badge>
      <span className="font-mono text-xs text-text-faint">md</span>
      <Badge size="md">Medium</Badge>
    </div>
  ),
};

export const WithDot: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-faint">default</span>
      <Badge tone="default" dot>
        Offline
      </Badge>
      <span className="font-mono text-xs text-text-faint">success</span>
      <Badge tone="success" dot>
        Synced
      </Badge>
      <span className="font-mono text-xs text-text-faint">warning</span>
      <Badge tone="warning" dot>
        Pending
      </Badge>
      <span className="font-mono text-xs text-text-faint">error</span>
      <Badge tone="error" dot>
        Failed
      </Badge>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-sm font-mono mr-2">Collection</span>
        <Badge tone="success" dot>
          Synced
        </Badge>
        <Badge tone="warning">3 missing</Badge>
        <Badge tone="error">Out of stock</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-sm font-mono mr-2">Deck</span>
        <Badge tone="accent">100 cards</Badge>
        <Badge tone="info">Avg CMC 2.4</Badge>
        <Badge size="sm">Updated 2d ago</Badge>
      </div>
    </div>
  ),
};
