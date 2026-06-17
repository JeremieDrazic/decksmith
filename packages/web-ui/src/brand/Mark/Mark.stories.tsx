import type { Meta, StoryObj } from '@storybook/react-vite';

import { Mark } from './Mark';

const meta = {
  title: 'Components/Brand/Mark',
  component: Mark,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: { size: 'md', animate: 'none' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    animate: { control: 'select', options: ['none', 'glow', 'tilt'] },
  },
} satisfies Meta<typeof Mark>;

export default meta;
type Story = StoryObj<typeof meta>;

// Playground first — always the entry point in Storybook's story list.
export const Playground: Story = {
  args: { 'aria-label': 'Decksmith' },
  parameters: { controls: { disable: false } },
};

// ─── Sizes ───────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-10">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Mark size={size} aria-label="Decksmith" />
          <span className="text-xs font-mono text-text-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
};

// ─── Animations ──────────────────────────────────────────────────────────────

export const Animations: Story = {
  name: 'Animations — none / glow / tilt',
  render: () => (
    <div className="flex flex-col gap-10">
      {(['none', 'glow', 'tilt'] as const).map((animate) => (
        <div key={animate} className="flex flex-col gap-2">
          <span className="text-xs font-mono text-text-muted">animate="{animate}"</span>
          <div className="flex items-end gap-10">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <Mark size={size} animate={animate} aria-label="Decksmith" />
                <span className="text-xs font-mono text-text-muted">{size}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
