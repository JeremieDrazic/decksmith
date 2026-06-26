import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Search, Trash2, X } from 'lucide-react';

import { IconButton } from './IconButton';

const meta = {
  title: 'Components/UI/IconButton',
  component: IconButton,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: {
    icon: <Plus aria-hidden={true} />,
    'aria-label': 'Add card',
    variant: 'ghost',
    size: 'md',
    isLoading: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'destructive'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loadingLabel: { control: 'text' },
    icon: { control: false },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { icon: <Plus aria-hidden={true} /> },
  parameters: { controls: { disable: false } },
};

export const Variants: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-faint">primary</span>
      <IconButton
        variant="primary"
        icon={<Plus aria-hidden={true} />}
        aria-label="Add card (primary)"
      />
      <span className="font-mono text-xs text-text-faint">secondary</span>
      <IconButton
        variant="secondary"
        icon={<Plus aria-hidden={true} />}
        aria-label="Add card (secondary)"
      />
      <span className="font-mono text-xs text-text-faint">ghost</span>
      <IconButton
        variant="ghost"
        icon={<Plus aria-hidden={true} />}
        aria-label="Add card (ghost)"
      />
      <span className="font-mono text-xs text-text-faint">destructive</span>
      <IconButton
        variant="destructive"
        icon={<Trash2 aria-hidden={true} />}
        aria-label="Delete deck"
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-faint">xs</span>
      <IconButton size="xs" icon={<Plus aria-hidden={true} />} aria-label="Add card (xs)" />
      <span className="font-mono text-xs text-text-faint">sm</span>
      <IconButton size="sm" icon={<Plus aria-hidden={true} />} aria-label="Add card (small)" />
      <span className="font-mono text-xs text-text-faint">md</span>
      <IconButton size="md" icon={<Plus aria-hidden={true} />} aria-label="Add card (medium)" />
      <span className="font-mono text-xs text-text-faint">lg</span>
      <IconButton size="lg" icon={<Plus aria-hidden={true} />} aria-label="Add card (large)" />
    </div>
  ),
};

export const CommonActions: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-muted text-sm font-mono mb-3">
          Ghost — toolbar / contextual actions
        </p>
        <div className="flex items-center gap-2">
          <IconButton variant="ghost" icon={<Plus aria-hidden={true} />} aria-label="Add card" />
          <IconButton variant="ghost" icon={<Search aria-hidden={true} />} aria-label="Search" />
          <IconButton variant="ghost" icon={<X aria-hidden={true} />} aria-label="Close" />
        </div>
      </div>
      <div>
        <p className="text-text-muted text-sm font-mono mb-3">Primary — prominent single action</p>
        <div className="flex items-center gap-2">
          <IconButton
            variant="primary"
            size="lg"
            icon={<Plus aria-hidden={true} />}
            aria-label="Add card"
          />
        </div>
      </div>
      <div>
        <p className="text-text-muted text-sm font-mono mb-3">Destructive — danger zone</p>
        <div className="flex items-center gap-2">
          <IconButton
            variant="destructive"
            icon={<Trash2 aria-hidden={true} />}
            aria-label="Delete deck"
          />
          <IconButton
            variant="destructive"
            size="sm"
            icon={<Trash2 aria-hidden={true} />}
            aria-label="Remove card"
          />
        </div>
      </div>
      <div>
        <p className="text-text-muted text-sm font-mono mb-3">xs — chip close, inline actions</p>
        <div className="flex items-center gap-2">
          <IconButton size="xs" icon={<X aria-hidden={true} />} aria-label="Remove tag" />
          <IconButton
            size="xs"
            variant="destructive"
            icon={<X aria-hidden={true} />}
            aria-label="Remove card from deck"
          />
        </div>
      </div>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-sm font-mono">
        Icon hidden — spinner overlays. Button stays square, no layout shift.
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <IconButton
          variant="primary"
          icon={<Plus aria-hidden={true} />}
          aria-label="Add card"
          isLoading
          loadingLabel="Adding card…"
        />
        <IconButton
          variant="secondary"
          icon={<Plus aria-hidden={true} />}
          aria-label="Add card"
          isLoading
          loadingLabel="Adding card…"
        />
        <IconButton variant="ghost" icon={<X aria-hidden={true} />} aria-label="Close" isLoading />
        <IconButton
          variant="destructive"
          icon={<Trash2 aria-hidden={true} />}
          aria-label="Delete deck"
          isLoading
          loadingLabel="Deleting…"
        />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-faint">primary</span>
      <IconButton
        variant="primary"
        icon={<Plus aria-hidden={true} />}
        aria-label="Add card"
        disabled
      />
      <span className="font-mono text-xs text-text-faint">secondary</span>
      <IconButton
        variant="secondary"
        icon={<Plus aria-hidden={true} />}
        aria-label="Add card"
        disabled
      />
      <span className="font-mono text-xs text-text-faint">ghost</span>
      <IconButton
        variant="ghost"
        icon={<Search aria-hidden={true} />}
        aria-label="Search"
        disabled
      />
      <span className="font-mono text-xs text-text-faint">destructive</span>
      <IconButton
        variant="destructive"
        icon={<Trash2 aria-hidden={true} />}
        aria-label="Delete deck"
        disabled
      />
    </div>
  ),
};
