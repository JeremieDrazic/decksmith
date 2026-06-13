import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './Button';

// Minimal inline SVGs — no external icon dep in packages/web-ui
const PlusIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const meta = {
  title: 'Components/UI/Button',
  component: Button,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: {
    children: 'Save deck',
    variant: 'primary',
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
    // icons are React nodes — not editable via controls
    startIcon: { control: false },
    endIcon: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: { controls: { disable: false } },
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3 flex-wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <Button size="xs">XSmall</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button startIcon={<PlusIcon />}>Add card</Button>
        <Button endIcon={<ArrowRightIcon />}>Continue</Button>
        <Button startIcon={<PlusIcon />} endIcon={<ArrowRightIcon />}>
          Both icons
        </Button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="secondary" startIcon={<PlusIcon />}>
          Secondary
        </Button>
        <Button variant="ghost" startIcon={<PlusIcon />}>
          Ghost
        </Button>
        <Button variant="destructive" startIcon={<PlusIcon />}>
          Destructive
        </Button>
      </div>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-sm font-mono">
        Width is preserved — hover to confirm no layout shift
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <Button isLoading loadingLabel="Saving…">
          Save deck
        </Button>
        <Button variant="secondary" isLoading loadingLabel="Saving…">
          Save deck
        </Button>
        <Button variant="ghost" isLoading>
          Cancel
        </Button>
        <Button variant="destructive" isLoading loadingLabel="Deleting…">
          Delete deck
        </Button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-text-muted text-sm font-mono w-full">With icons (all hidden)</p>
        <Button isLoading loadingLabel="Saving…" startIcon={<PlusIcon />}>
          Save deck
        </Button>
        <Button isLoading loadingLabel="Saving…" endIcon={<ArrowRightIcon />}>
          Continue
        </Button>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-3 flex-wrap">
      <Button disabled>Primary</Button>
      <Button variant="secondary" disabled>
        Secondary
      </Button>
      <Button variant="ghost" disabled>
        Ghost
      </Button>
      <Button variant="destructive" disabled>
        Destructive
      </Button>
    </div>
  ),
};
