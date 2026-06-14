import type { Meta, StoryObj } from '@storybook/react-vite';

import { IconButton } from './IconButton';

const PlusIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const meta = {
  title: 'Components/UI/IconButton',
  component: IconButton,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: {
    icon: <PlusIcon />,
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
  args: { icon: <PlusIcon /> },
  parameters: { controls: { disable: false } },
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3 flex-wrap">
      <IconButton variant="primary" icon={<PlusIcon />} aria-label="Add card (primary)" />
      <IconButton variant="secondary" icon={<PlusIcon />} aria-label="Add card (secondary)" />
      <IconButton variant="ghost" icon={<PlusIcon />} aria-label="Add card (ghost)" />
      <IconButton variant="destructive" icon={<TrashIcon />} aria-label="Delete deck" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <IconButton size="xs" icon={<PlusIcon />} aria-label="Add card (xs)" />
      <IconButton size="sm" icon={<PlusIcon />} aria-label="Add card (small)" />
      <IconButton size="md" icon={<PlusIcon />} aria-label="Add card (medium)" />
      <IconButton size="lg" icon={<PlusIcon />} aria-label="Add card (large)" />
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
          <IconButton variant="ghost" icon={<PlusIcon />} aria-label="Add card" />
          <IconButton variant="ghost" icon={<SearchIcon />} aria-label="Search" />
          <IconButton variant="ghost" icon={<CloseIcon />} aria-label="Close" />
        </div>
      </div>
      <div>
        <p className="text-text-muted text-sm font-mono mb-3">Primary — prominent single action</p>
        <div className="flex items-center gap-2">
          <IconButton variant="primary" size="lg" icon={<PlusIcon />} aria-label="Add card" />
        </div>
      </div>
      <div>
        <p className="text-text-muted text-sm font-mono mb-3">Destructive — danger zone</p>
        <div className="flex items-center gap-2">
          <IconButton variant="destructive" icon={<TrashIcon />} aria-label="Delete deck" />
          <IconButton
            variant="destructive"
            size="sm"
            icon={<TrashIcon />}
            aria-label="Remove card"
          />
        </div>
      </div>
      <div>
        <p className="text-text-muted text-sm font-mono mb-3">xs — chip close, inline actions</p>
        <div className="flex items-center gap-2">
          <IconButton size="xs" icon={<CloseIcon />} aria-label="Remove tag" />
          <IconButton
            size="xs"
            variant="destructive"
            icon={<CloseIcon />}
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
          icon={<PlusIcon />}
          aria-label="Add card"
          isLoading
          loadingLabel="Adding card…"
        />
        <IconButton
          variant="secondary"
          icon={<PlusIcon />}
          aria-label="Add card"
          isLoading
          loadingLabel="Adding card…"
        />
        <IconButton variant="ghost" icon={<CloseIcon />} aria-label="Close" isLoading />
        <IconButton
          variant="destructive"
          icon={<TrashIcon />}
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
    <div className="flex items-center gap-3 flex-wrap">
      <IconButton variant="primary" icon={<PlusIcon />} aria-label="Add card" disabled />
      <IconButton variant="secondary" icon={<PlusIcon />} aria-label="Add card" disabled />
      <IconButton variant="ghost" icon={<SearchIcon />} aria-label="Search" disabled />
      <IconButton variant="destructive" icon={<TrashIcon />} aria-label="Delete deck" disabled />
    </div>
  ),
};
