import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Plus } from 'lucide-react';

import { Button } from './Button';

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
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-muted">primary</span>
      <Button variant="primary">Primary</Button>
      <span className="font-mono text-xs text-text-muted">secondary</span>
      <Button variant="secondary">Secondary</Button>
      <span className="font-mono text-xs text-text-muted">ghost</span>
      <Button variant="ghost">Ghost</Button>
      <span className="font-mono text-xs text-text-muted">destructive</span>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-muted">xs</span>
      <Button size="xs">XSmall</Button>
      <span className="font-mono text-xs text-text-muted">sm</span>
      <Button size="sm">Small</Button>
      <span className="font-mono text-xs text-text-muted">md</span>
      <Button size="md">Medium</Button>
      <span className="font-mono text-xs text-text-muted">lg</span>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button startIcon={<Plus aria-hidden={true} />}>Add card</Button>
        <Button endIcon={<ArrowRight aria-hidden={true} />}>Continue</Button>
        <Button startIcon={<Plus aria-hidden={true} />} endIcon={<ArrowRight aria-hidden={true} />}>
          Both icons
        </Button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="secondary" startIcon={<Plus aria-hidden={true} />}>
          Secondary
        </Button>
        <Button variant="ghost" startIcon={<Plus aria-hidden={true} />}>
          Ghost
        </Button>
        <Button variant="destructive" startIcon={<Plus aria-hidden={true} />}>
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
        <Button variant="ghost" isLoading loadingLabel="Cancelling…">
          Cancel
        </Button>
        <Button variant="destructive" isLoading loadingLabel="Deleting…">
          Delete deck
        </Button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-text-muted text-sm font-mono w-full">With icons (all hidden)</p>
        <Button isLoading loadingLabel="Saving…" startIcon={<Plus aria-hidden={true} />}>
          Save deck
        </Button>
        <Button isLoading loadingLabel="Saving…" endIcon={<ArrowRight aria-hidden={true} />}>
          Continue
        </Button>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-muted">primary</span>
      <Button disabled>Primary</Button>
      <span className="font-mono text-xs text-text-muted">secondary</span>
      <Button variant="secondary" disabled>
        Secondary
      </Button>
      <span className="font-mono text-xs text-text-muted">ghost</span>
      <Button variant="ghost" disabled>
        Ghost
      </Button>
      <span className="font-mono text-xs text-text-muted">destructive</span>
      <Button variant="destructive" disabled>
        Destructive
      </Button>
    </div>
  ),
};
