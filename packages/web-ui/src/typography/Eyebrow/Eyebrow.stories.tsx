import type { Meta, StoryObj } from '@storybook/react-vite';

import { Eyebrow } from './Eyebrow';

const meta = {
  title: 'Components/Typography/Eyebrow',
  component: Eyebrow,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: { children: 'Mana curve' },
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['muted', 'default', 'accent'] as const).map((tone) => (
        <Eyebrow key={tone} tone={tone}>
          {tone} — Mana curve
        </Eyebrow>
      ))}
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow tone="accent">Commander</Eyebrow>
        <p className="mt-1 font-display text-2xl font-bold text-text">Atraxa, Praetors' Voice</p>
      </div>
      <div>
        <Eyebrow>Mana curve</Eyebrow>
        <p className="mt-1 text-sm text-text-muted">Average CMC 3.4 · 24 lands</p>
      </div>
      <div>
        <Eyebrow as="p">Legendary Creature — Phyrexian Praetor</Eyebrow>
        <p className="mt-1 text-sm text-text">Flying, deathtouch, lifelink, proliferate.</p>
      </div>
    </div>
  ),
};
