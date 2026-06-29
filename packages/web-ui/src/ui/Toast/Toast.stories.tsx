import { useEffect } from 'react';

import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import { Toaster, ToastProvider, useToast } from './Toast';

// ─── Provider decorator ───────────────────────────────────────────────────────

// Every story needs a ToastProvider + Toaster in the tree.
// The limit is raised to 6 for multi-toast stories (Tones, Stack).
const withProvider: Decorator = (Story) => (
  <ToastProvider limit={6}>
    <Story />
    <Toaster />
  </ToastProvider>
);

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Components/UI/Toast',
  component: Toaster,
  decorators: [withProvider],
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  render: () => {
    function Demo() {
      const { add } = useToast();
      return (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={() =>
              add({
                title: 'Card added',
                description: '4× Ragavan → Modern Cascade',
                type: 'success',
                timeout: 4000,
              })
            }
          >
            Success
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              add({
                title: 'Import failed',
                description: 'Line 14 — card not found on Scryfall',
                type: 'error',
                timeout: 4000,
              })
            }
          >
            Error
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              add({
                title: 'Banned card',
                description: 'Hogaak is banned in Modern',
                type: 'warning',
                timeout: 4000,
              })
            }
          >
            Warning
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              add({
                title: 'Prices refreshed',
                description: '47 cards updated',
                type: 'info',
                timeout: 4000,
              })
            }
          >
            Info
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              add({ title: 'Deck saved', description: 'The Ur-Dragon autosaved', timeout: 4000 })
            }
          >
            Default
          </Button>
        </div>
      );
    }
    return <Demo />;
  },
};

// ─── Tones ────────────────────────────────────────────────────────────────────

/** All 5 tones fired at once — toasts persist until dismissed. */
export const Tones: Story = {
  render: () => {
    function Demo() {
      const { add } = useToast();
      useEffect(() => {
        add({
          title: 'Card added',
          description: '4× Llanowar Elves → The Ur-Dragon',
          type: 'success',
          timeout: 0,
        });
        add({
          title: 'Import failed',
          description: 'Line 14 — card not found on Scryfall',
          type: 'error',
          timeout: 0,
        });
        add({
          title: 'Coverage dropped',
          description: "You're missing 12 cards from this deck",
          type: 'warning',
          timeout: 0,
        });
        add({
          title: 'Prices refreshed',
          description: '47 cards updated',
          type: 'info',
          timeout: 0,
        });
        add({ title: 'Deck saved', description: 'The Ur-Dragon · 100 cards', timeout: 0 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return (
        <p className="font-mono text-xs text-text-faint">
          Toasts appear bottom-right — hover to expand stack
        </p>
      );
    }
    return <Demo />;
  },
};

// ─── WithAction ───────────────────────────────────────────────────────────────

/** Toasts with an action button — Undo, Download, View. */
export const WithAction: Story = {
  render: () => {
    function Demo() {
      const { add } = useToast();
      return (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              add({
                title: 'Card removed',
                description: 'Ragavan removed from Modern Cascade',
                type: 'success',
                timeout: 6000,
                actionProps: { children: 'Undo', onClick: () => {} },
              })
            }
          >
            Card removed (Undo)
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              add({
                title: 'PDF ready',
                description: 'Your proxy sheet is ready to download',
                type: 'info',
                timeout: 8000,
                actionProps: { children: 'Download', onClick: () => {} },
              })
            }
          >
            PDF ready (Download)
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              add({
                title: 'Banned card detected',
                description: 'Hogaak is banned in Modern',
                type: 'warning',
                timeout: 8000,
                actionProps: { children: 'View banlists', onClick: () => {} },
              })
            }
          >
            Banned card (View)
          </Button>
        </div>
      );
    }
    return <Demo />;
  },
};

// ─── Loading ──────────────────────────────────────────────────────────────────

/** Loading toast — no auto-dismiss, no progress bar. Use with `promise()` for async flows. */
export const Loading: Story = {
  render: () => {
    function Demo() {
      const { add, promise } = useToast();
      return (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => add({ title: 'Syncing collection…', type: 'loading', timeout: 0 })}
          >
            Loading (manual)
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const work = new Promise<void>((resolve, reject) => {
                const ok = Math.random() > 0.4;
                setTimeout(ok ? resolve : reject, 2000);
              });
              promise(work, {
                loading: { title: 'Importing deck…', type: 'loading' },
                success: {
                  title: 'Import complete',
                  description: '72 cards added',
                  type: 'success',
                },
                error: {
                  title: 'Import failed',
                  description: 'Check your file format',
                  type: 'error',
                },
              });
            }}
          >
            promise() — 60 % success
          </Button>
        </div>
      );
    }
    return <Demo />;
  },
};

// ─── Stack ────────────────────────────────────────────────────────────────────

/** Fire 3 toasts rapidly to see the collapsed stack — hover to expand. */
export const Stack: Story = {
  render: () => {
    function Demo() {
      const { add } = useToast();
      return (
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => {
              add({
                title: 'Card added',
                description: '4× Llanowar Elves → The Ur-Dragon',
                type: 'success',
                timeout: 8000,
              });
              add({
                title: 'Prices refreshed',
                description: '47 cards updated',
                type: 'info',
                timeout: 8000,
              });
              add({
                title: 'Coverage dropped',
                description: '12 missing cards',
                type: 'warning',
                timeout: 8000,
              });
            }}
          >
            Fire 3 toasts
          </Button>
        </div>
      );
    }
    return <Demo />;
  },
};

// ─── Position ─────────────────────────────────────────────────────────────────

/** Top-center positioning — useful for global alerts. */
export const TopCenter: Story = {
  decorators: [
    (Story) => (
      <ToastProvider limit={3}>
        <Story />
        <Toaster position="top-center" />
      </ToastProvider>
    ),
  ],
  render: () => {
    function Demo() {
      const { add } = useToast();
      return (
        <Button
          variant="secondary"
          onClick={() =>
            add({
              title: 'Deck published',
              description: 'The Ur-Dragon is now public',
              type: 'success',
              timeout: 4000,
            })
          }
        >
          Fire (top-center)
        </Button>
      );
    }
    return <Demo />;
  },
};
