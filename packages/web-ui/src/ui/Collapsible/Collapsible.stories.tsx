import type { Meta, StoryObj } from '@storybook/react-vite';
import { Filter } from 'lucide-react';

import { Badge } from '../Badge/Badge';
import { Checkbox } from '../Checkbox/Checkbox';
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from './Collapsible';

const meta = {
  title: 'Components/UI/Collapsible',
  component: Collapsible,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: { defaultOpen: true, disabled: false },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <div className="w-80">
      <Collapsible {...args}>
        <CollapsibleTrigger>Section title</CollapsibleTrigger>
        <CollapsiblePanel>
          <p className="pb-3 pt-1 text-sm text-text-muted">
            Panel content — expands and collapses with an animated height transition.
          </p>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  ),
};

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div className="flex gap-12">
      {([true, false] as const).map((open) => (
        <div key={String(open)}>
          <span className="mb-2 block font-mono text-xs text-text-muted">
            {open ? 'open' : 'closed'}
          </span>
          <div className="w-64">
            <Collapsible defaultOpen={open}>
              <CollapsibleTrigger>Details</CollapsibleTrigger>
              <CollapsiblePanel>
                <p className="pb-2 pt-1 text-sm text-text-muted">
                  Additional information about this item.
                </p>
              </CollapsiblePanel>
            </Collapsible>
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── Separator ────────────────────────────────────────────────────────────────

export const Separator: Story = {
  render: () => (
    <div className="flex gap-12">
      {([false, true] as const).map((sep) => (
        <div key={String(sep)}>
          <span className="mb-2 block font-mono text-xs text-text-muted">
            {sep ? 'separator' : 'no separator'}
          </span>
          <div className="w-64">
            <Collapsible defaultOpen>
              <CollapsibleTrigger separator={sep}>Section</CollapsibleTrigger>
              <CollapsiblePanel>
                <p className="pb-2 pt-2 text-sm text-text-muted">Panel content below the line.</p>
              </CollapsiblePanel>
            </Collapsible>
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── KeepMounted ─────────────────────────────────────────────────────────────

export const KeepMounted: Story = {
  render: () => (
    <div className="w-72">
      <p className="mb-3 px-3 font-mono text-xs text-text-muted">
        keepMounted — panel stays in DOM when closed (useful for forms)
      </p>
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger>Advanced options</CollapsibleTrigger>
        <CollapsiblePanel keepMounted>
          <div className="flex flex-col gap-3 pb-3 pt-2">
            <label className="flex items-center gap-2 text-sm text-text">
              <Checkbox defaultChecked />
              Enable foil detection
            </label>
            <label className="flex items-center gap-2 text-sm text-text">
              <Checkbox />
              Show price history
            </label>
          </div>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  ),
};

// ─── Examples ────────────────────────────────────────────────────────────────

export const Examples: Story = {
  render: () => (
    <div className="flex items-start gap-12">
      {/* Deck builder section list */}
      <div>
        <p className="mb-3 font-mono text-xs text-text-muted">Deck builder — sections</p>
        <div className="w-64 overflow-hidden rounded-surface border border-border bg-surface">
          {(
            [
              {
                label: 'Creatures',
                count: 12,
                cards: ['Ragavan, Nimble Pilferer', "Dragon's Rage Channeler", 'Murktide Regent'],
                open: true,
              },
              {
                label: 'Instants',
                count: 8,
                cards: ['Lightning Bolt', 'Counterspell'],
                open: false,
              },
              {
                label: 'Lands',
                count: 20,
                cards: ['Island', 'Mountain', 'Scalding Tarn'],
                open: false,
              },
            ] as const
          ).map(({ label, count, cards, open }) => (
            <div key={label} className="border-b border-border last:border-0">
              <Collapsible defaultOpen={open}>
                <CollapsibleTrigger flush separator={open}>
                  <div className="flex items-center gap-2">
                    <span>{label}</span>
                    <Badge size="sm">{count}</Badge>
                  </div>
                </CollapsibleTrigger>
                <CollapsiblePanel>
                  <ul className="space-y-1.5 pb-3 pt-1 text-sm text-text-muted">
                    {cards.map((card) => (
                      <li key={card}>{card}</li>
                    ))}
                  </ul>
                </CollapsiblePanel>
              </Collapsible>
            </div>
          ))}
        </div>
      </div>

      {/* Filter sidebar */}
      <div>
        <p className="mb-3 font-mono text-xs text-text-muted">Filter sidebar</p>
        <div className="w-52 overflow-hidden rounded-surface border border-border bg-surface py-2">
          <div className="mb-2 flex items-center gap-2 px-3 text-sm font-medium text-text">
            <Filter aria-hidden className="size-4 text-text-muted" />
            Filters
          </div>
          <div className="flex flex-col">
            {(
              [
                { label: 'Rarity', options: ['Common', 'Uncommon', 'Rare', 'Mythic'] },
                { label: 'Type', options: ['Creature', 'Instant', 'Sorcery', 'Land'] },
              ] as const
            ).map(({ label, options }) => (
              <Collapsible key={label} defaultOpen>
                <CollapsibleTrigger flush separator>
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {label}
                  </span>
                </CollapsibleTrigger>
                <CollapsiblePanel>
                  <div className="flex flex-col gap-2 pb-3 pt-2">
                    {options.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm text-text">
                        <Checkbox />
                        {opt}
                      </label>
                    ))}
                  </div>
                </CollapsiblePanel>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};
