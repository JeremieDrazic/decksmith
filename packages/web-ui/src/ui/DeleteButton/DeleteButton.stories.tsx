import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { noop } from '@decksmith/utils';

import { DeleteButton } from './DeleteButton';

const meta = {
  title: 'Components/UI/DeleteButton',
  component: DeleteButton,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: { onDelete: noop },
} satisfies Meta<typeof DeleteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  argTypes: {
    confirmLabel: { control: 'text' },
    timeout: { control: 'number' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'Delete deck',
    confirmLabel: 'Confirm deletion',
    timeout: 3000,
    onDelete: noop,
  },
};

/**
 * First click arms the button (icon changes, label becomes "Confirm deletion").
 * Second click within 3 seconds fires `onDelete`. Waiting resets automatically.
 */
export const Default: Story = {
  render: () => <DeleteButton onDelete={() => alert('Deleted')}>Delete deck</DeleteButton>,
};

export const Sizes: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_auto] items-center justify-items-start gap-x-8 gap-y-3">
      <span className="font-mono text-xs text-text-muted">xs</span>
      <DeleteButton size="xs" onDelete={noop}>
        Delete
      </DeleteButton>
      <span className="font-mono text-xs text-text-muted">sm</span>
      <DeleteButton size="sm" onDelete={noop}>
        Delete
      </DeleteButton>
      <span className="font-mono text-xs text-text-muted">md</span>
      <DeleteButton size="md" onDelete={noop}>
        Delete
      </DeleteButton>
      <span className="font-mono text-xs text-text-muted">lg</span>
      <DeleteButton size="lg" onDelete={noop}>
        Delete
      </DeleteButton>
    </div>
  ),
};

/**
 * Multiple delete buttons in a list — each manages its own armed state
 * independently. Arming one does not affect the others.
 */
export const InList: Story = {
  render: function InList() {
    const [decks, setDecks] = useState(['Commander Goodstuff', 'Burn Everything', 'Control Tower']);

    return (
      <div className="flex w-64 flex-col divide-y divide-border">
        {decks.map((deck) => (
          <div
            key={deck}
            className="flex items-center justify-between gap-4 py-2.5 text-sm text-text"
          >
            <span>{deck}</span>
            <DeleteButton
              size="sm"
              onDelete={() => setDecks((prev) => prev.filter((d) => d !== deck))}
            >
              Delete
            </DeleteButton>
          </div>
        ))}
      </div>
    );
  },
};
