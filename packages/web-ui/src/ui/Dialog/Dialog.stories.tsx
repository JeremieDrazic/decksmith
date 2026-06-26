import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Dialog,
} from './Dialog';

const meta = {
  title: 'Components/UI/Dialog',
  component: DialogContent,
  parameters: { layout: 'centered', controls: { disable: true } },
} satisfies Meta<typeof DialogContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>Open dialog</DialogTrigger>
      <DialogContent {...args}>
        <DialogTitle>Dialog title</DialogTitle>
        <DialogDescription>
          This is the dialog description. It provides context for the action below.
        </DialogDescription>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** Standard trigger-driven dialog with a cancel + confirm footer. */
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogTitle>Save changes</DialogTitle>
        <DialogDescription>
          You have unsaved changes. Do you want to save them before leaving?
        </DialogDescription>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Discard</DialogClose>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * Controlled by external state — no `DialogTrigger`.
 * This is the manager-ready pattern: the dialog is driven by `open`/`onOpenChange`
 * from a parent component, not by a trigger inside the dialog tree.
 * A future modal manager will use this exact pattern to hoist a single dialog.
 */
export const Controlled: Story = {
  render: function Controlled() {
    const [open, setOpen] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open (controlled)
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent showCloseButton={false}>
            <DialogTitle>Delete deck</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>Commander Goodstuff</strong>? This action
              cannot be undone.
            </DialogDescription>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
              <Button variant="destructive" onClick={() => setOpen(false)}>
                Delete deck
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};

/**
 * A dialog with enough content to scroll — verifies that `max-h` +
 * `overflow-y-auto` keep the panel inside the viewport.
 */
export const LongContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>Open long dialog</DialogTrigger>
      <DialogContent>
        <DialogTitle>Card collection rules</DialogTitle>
        <DialogDescription>
          Please read the following rules carefully before importing your collection.
        </DialogDescription>
        <div className="mt-4 space-y-3 text-sm text-text-muted">
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i}>
              Rule {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
              nostrud exercitation ullamco laboris.
            </p>
          ))}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button>Accept &amp; import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
