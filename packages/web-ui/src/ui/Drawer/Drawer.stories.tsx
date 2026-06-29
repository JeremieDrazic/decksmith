import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from './Drawer';
import type { DrawerSide } from './types';

const meta = {
  title: 'Components/UI/Drawer',
  component: DrawerContent,
  parameters: { layout: 'centered', controls: { disable: true } },
} satisfies Meta<typeof DrawerContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  argTypes: {
    showCloseButton: { control: 'boolean' },
    closeIcon: { control: 'select', options: ['close', 'directional'] },
  },
  args: {
    showCloseButton: true,
    closeIcon: 'close',
  },
  render: function Playground(args) {
    const [side, setSide] = useState<DrawerSide>('right');

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {(['top', 'right', 'bottom', 'left'] as const).map((s) => (
            <Button
              key={s}
              variant={side === s ? 'primary' : 'secondary'}
              onClick={() => setSide(s)}
            >
              {s}
            </Button>
          ))}
        </div>
        <Drawer side={side}>
          <DrawerTrigger render={<Button variant="secondary" />}>Open drawer</DrawerTrigger>
          <DrawerContent {...args}>
            <DrawerTitle>Drawer</DrawerTitle>
            <DrawerDescription>
              A panel that slides in from the {side} edge. Swipe to dismiss.
            </DrawerDescription>
            <DrawerFooter>
              <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
              <Button>Confirm</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    );
  },
};

/** One trigger per edge — verifies alignment, border, radius, and slide direction. */
export const Sides: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(['right', 'left', 'bottom', 'top'] as const).map((side) => (
        <Drawer key={side} side={side}>
          <DrawerTrigger render={<Button variant="secondary" />}>Open {side}</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>{side.charAt(0).toUpperCase() + side.slice(1)} drawer</DrawerTitle>
            <DrawerDescription>
              Slides in from the {side}. Swipe or press Escape to dismiss.
            </DrawerDescription>
            <DrawerFooter>
              <DrawerClose render={<Button variant="ghost" />}>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  ),
};

/**
 * Directional close icon — chevron points toward the exit edge.
 * left → ← (back),  right → → (forward),  top/bottom → X (fallback).
 * The tooltip and aria-label always read "Close" regardless of the icon.
 */
export const DirectionalClose: Story = {
  render: () => (
    <div className="flex gap-3">
      {(['left', 'right'] as const).map((side) => (
        <Drawer key={side} side={side}>
          <DrawerTrigger render={<Button variant="secondary" />}>Open {side}</DrawerTrigger>
          <DrawerContent closeIcon="directional">
            <DrawerTitle>{side === 'left' ? '← Left' : 'Right →'} drawer</DrawerTitle>
            <DrawerDescription>
              Close button shows a directional chevron ({side === 'left' ? '←' : '→'}) pointing
              toward the exit edge. Tooltip + screen reader still say "Close".
            </DrawerDescription>
            <DrawerFooter>
              <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  ),
};

/**
 * Controlled by external state — no `DrawerTrigger`.
 * The drawer is driven by `open`/`onOpenChange` from a parent component.
 * `showCloseButton={false}` — the footer cancel button is the only dismiss action.
 */
export const Controlled: Story = {
  render: function Controlled() {
    const [open, setOpen] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open (controlled)
        </Button>
        <Drawer side="right" open={open} onOpenChange={setOpen}>
          <DrawerContent showCloseButton={false}>
            <DrawerTitle>Add card to deck</DrawerTitle>
            <DrawerDescription>
              Select a quantity and condition before adding to your deck.
            </DrawerDescription>
            <DrawerFooter>
              <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
              <Button onClick={() => setOpen(false)}>Add to deck</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    );
  },
};

/**
 * Bottom sheet with snap points — opens at 40 % height, drag up to expand to full.
 * Drag down past the first snap point to dismiss. Demonstrates Base UI snap-point support.
 */
export const BottomSheet: Story = {
  render: () => (
    <Drawer side="bottom" snapPoints={[0.4, 1]}>
      <DrawerTrigger render={<Button variant="secondary" />}>Open bottom sheet</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>Add to collection</DrawerTitle>
        <DrawerDescription>
          Drag up to expand, drag down to dismiss. Two snap points: 40 % and full height.
        </DrawerDescription>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {['NM', 'LP', 'MP', 'HP', 'DMG'].map((condition) => (
            <Button key={condition} variant="secondary">
              {condition}
            </Button>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
          <Button>Add card</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

/**
 * Enough content to scroll inside the panel — verifies that `overflow-y-auto`
 * keeps the drawer within the viewport without the page scrolling behind it.
 */
export const LongContent: Story = {
  render: () => (
    <Drawer side="right">
      <DrawerTrigger render={<Button variant="secondary" />}>Open long drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>Deck rules</DrawerTitle>
        <DrawerDescription>
          Please read all format rules before submitting your deck.
        </DrawerDescription>
        <div className="mt-4 space-y-3 text-sm text-text-muted">
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i}>
              Rule {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
              nostrud exercitation ullamco laboris.
            </p>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
          <Button>Accept &amp; continue</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
