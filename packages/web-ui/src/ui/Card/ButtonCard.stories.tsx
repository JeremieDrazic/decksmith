import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ButtonCard } from './Card';

const meta = {
  title: 'Components/UI/ButtonCard',
  component: ButtonCard,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof ButtonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <ButtonCard className="w-72" {...args}>
      <p className="text-sm text-text">Hover to see the lift + glow effect.</p>
    </ButtonCard>
  ),
};

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <ButtonCard className="w-72">
      <p className="text-sm font-medium text-text">Add to collection</p>
      <p className="text-xs text-text-muted mt-0.5">Click to open the search panel</p>
    </ButtonCard>
  ),
};

// ─── Selectable ───────────────────────────────────────────────────────────────

const FORMATS = ['Standard', 'Pioneer', 'Modern', 'Commander', 'Legacy'];

function SelectableDemo() {
  const [selected, setSelected] = React.useState<string | null>('Commander');

  return (
    <div className="flex flex-wrap gap-2">
      {FORMATS.map((format) => (
        <ButtonCard
          key={format}
          onClick={() => setSelected(format)}
          padding="sm"
          className={
            selected === format
              ? 'border-accent-border shadow-[var(--shadow-card),var(--shadow-accent)]'
              : ''
          }
        >
          <span className="text-sm font-medium text-text">{format}</span>
        </ButtonCard>
      ))}
    </div>
  );
}

export const Selectable: Story = {
  render: () => <SelectableDemo />,
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  parameters: { a11y: { disable: true } },
  render: () => (
    <ButtonCard disabled className="w-72">
      <p className="text-sm font-medium text-text">Add to collection</p>
      <p className="text-xs text-text-muted mt-0.5">Not available right now</p>
    </ButtonCard>
  ),
};
