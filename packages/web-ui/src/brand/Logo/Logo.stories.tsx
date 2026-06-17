import type { Meta, StoryObj } from '@storybook/react-vite';

import { Logo } from './Logo';

const meta = {
  title: 'Components/Brand/Logo',
  component: Logo,
  parameters: { layout: 'padded', controls: { disable: true } },
  args: { variant: 'lockup', size: 'md', animate: 'none' },
  argTypes: {
    variant: { control: 'select', options: ['lockup', 'wordmark'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    animate: { control: 'select', options: ['none', 'glow', 'tilt'] },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

// Playground first — always the entry point in Storybook's story list.
export const Playground: Story = {
  parameters: { controls: { disable: false } },
};

export const Default: Story = {};

// ─── Variants ────────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(['lockup', 'wordmark'] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <span className="text-xs font-mono text-text-muted">{variant}</span>
          <Logo variant={variant} />
        </div>
      ))}
    </div>
  ),
};

// ─── Sizes ───────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <span className="text-xs font-mono text-text-muted">size="{size}"</span>
          <Logo size={size} />
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
          <Logo size="lg" animate={animate} />
        </div>
      ))}
    </div>
  ),
};

// ─── All Combinations ─────────────────────────────────────────────────────────

export const AllCombinations: Story = {
  name: 'All Combinations',
  render: () => (
    <div className="flex flex-col gap-12">
      {(['glow', 'tilt'] as const).map((animate) => (
        <div key={animate} className="flex flex-col gap-6">
          <span className="text-xs font-mono text-text-muted uppercase tracking-wide pb-2 border-b border-border-subtle">
            animate="{animate}"
          </span>
          <div className="flex flex-col gap-8">
            {(['lockup', 'wordmark'] as const).map((variant) => (
              <div key={variant} className="flex flex-col gap-3">
                <span className="text-xs font-mono text-text-muted">variant="{variant}"</span>
                <div className="flex items-end gap-10 flex-wrap">
                  {(['sm', 'md', 'lg'] as const).map((size) => (
                    <div key={size} className="flex flex-col items-start gap-2">
                      <Logo variant={variant} size={size} animate={animate} />
                      <span className="text-xs font-mono text-text-muted">{size}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

// ─── Surfaces ─────────────────────────────────────────────────────────────────

export const OnSurfaces: Story = {
  name: 'OnSurfaces — transparent cutout',
  render: () => (
    <div className="flex flex-col gap-3">
      {[
        { label: 'bg', cls: 'bg-bg' },
        { label: 'surface', cls: 'bg-surface' },
        { label: 'surface-raised', cls: 'bg-surface-raised' },
      ].map(({ label, cls }) => (
        <div
          key={label}
          className={`flex items-center justify-between rounded-surface px-5 py-4 ${cls}`}
        >
          <Logo animate="glow" />
          <span className="text-xs font-mono text-text-muted">{label}</span>
        </div>
      ))}
    </div>
  ),
};
