import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './AlertDialog';

const meta = {
  title: 'Components/UI/AlertDialog',
  component: AlertDialogContent,
  parameters: { layout: 'centered', controls: { disable: true } },
} satisfies Meta<typeof AlertDialogContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="secondary" />}>Open alert</AlertDialogTrigger>
      <AlertDialogContent {...args}>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
          <Button>Confirm</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * The most common use case — a destructive confirmation before deleting data.
 * Note: there is no close button (✕) and Escape does not dismiss. The user
 * must choose Cancel or Delete explicitly.
 */
export const Destructive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>Delete deck</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete deck</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete <strong>Commander Goodstuff</strong>? All cards, sections,
          and notes will be permanently removed. This action cannot be undone.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
          <Button variant="destructive">Delete deck</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * Controlled by external state — manager-ready pattern.
 * The alert dialog is opened imperatively (e.g. from a list action) and
 * receives the target via the parent's state, not from a trigger inside the tree.
 */
export const Controlled: Story = {
  render: function Controlled() {
    const [target, setTarget] = useState<string | null>(null);
    const decks = ['Commander Goodstuff', 'Burn Everything', 'Control Tower'];

    return (
      <div className="flex w-64 flex-col divide-y divide-border">
        {decks.map((deck) => (
          <div
            key={deck}
            className="flex items-center justify-between gap-4 py-2.5 text-sm text-text"
          >
            <span>{deck}</span>
            <Button
              size="sm"
              variant="ghost"
              className="text-error-text hover:text-error"
              onClick={() => setTarget(deck)}
            >
              Delete
            </Button>
          </div>
        ))}
        <AlertDialog
          open={target !== null}
          onOpenChange={(open) => {
            if (!open) setTarget(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogTitle>Delete deck</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{target}</strong>? This cannot be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
              <Button variant="destructive" onClick={() => setTarget(null)}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  },
};
