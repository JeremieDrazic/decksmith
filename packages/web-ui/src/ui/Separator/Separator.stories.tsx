import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator } from './Separator';

const meta = {
  title: 'Components/UI/Separator',
  component: Separator,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <p className="text-sm text-text">Above the line</p>
      <Separator />
      <p className="text-sm text-text-muted">Below the line</p>
    </div>
  ),
};

export const NeutralVertical: Story = {
  render: () => (
    <div className="flex items-center gap-4 h-8">
      <span className="text-sm text-text">Cards</span>
      <Separator orientation="vertical" />
      <span className="text-sm text-text-muted">Decks</span>
      <Separator orientation="vertical" />
      <span className="text-sm text-text-muted">Collection</span>
    </div>
  ),
};

export const Brand: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <p className="text-sm text-text-muted font-mono">
        Section separator — between content blocks
      </p>
      <Separator variant="brand" />
      <div className="flex flex-col gap-3">
        <p className="text-base font-display font-semibold text-text">Atraxa, Praetors' Voice</p>
        <Separator variant="brand" />
        <p className="text-sm text-text-muted">Flying, deathtouch, lifelink, proliferate.</p>
      </div>
    </div>
  ),
};

export const BrandElaborate: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <p className="text-sm text-text-muted font-mono">Elaborate brand — major section breaks</p>
      <Separator variant="brand" elaborate />
      <div className="flex flex-col gap-3">
        <p className="text-base font-display font-semibold text-text">Commander Deck</p>
        <Separator variant="brand" elaborate />
        <p className="text-sm text-text-muted">100 cards, singleton format.</p>
      </div>
    </div>
  ),
};

export const NeutralWithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <p className="text-sm text-text">Sign in</p>
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-text-faint">or</span>
        <Separator className="flex-1" />
      </div>
      <p className="text-sm text-text-muted">Continue with email</p>
    </div>
  ),
};
