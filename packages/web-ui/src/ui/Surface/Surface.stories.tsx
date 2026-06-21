import type { Meta, StoryObj } from '@storybook/react-vite';

import { Surface } from './Surface';

const meta = {
  title: 'Components/UI/Surface',
  component: Surface,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <Surface className="w-64" {...args}>
      <p className="text-sm text-text">Surface content</p>
    </Surface>
  ),
};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4 items-start">
      <Surface variant="surface" padding="md" className="w-52">
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-wide mb-1">
          surface
        </p>
        <p className="text-sm text-text">Sits directly on the page background.</p>
      </Surface>
      <Surface variant="raised" padding="md" className="w-52">
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-wide mb-1">raised</p>
        <p className="text-sm text-text">Sits on a surface — adds elevation.</p>
      </Surface>
    </div>
  ),
};

// ─── Padding ──────────────────────────────────────────────────────────────────

export const Padding: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 items-start">
      {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
        <div key={p} className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-wide">{p}</span>
          <Surface padding={p} className="w-28">
            <span className="block text-xs text-text-muted">Content</span>
          </Surface>
        </div>
      ))}
    </div>
  ),
};

// ─── OnRaisedBg ───────────────────────────────────────────────────────────────

export const OnRaisedBg: Story = {
  render: () => (
    <div className="bg-surface-raised rounded-surface p-6 w-80">
      <p className="font-mono text-[10px] text-text-muted uppercase tracking-wide mb-3">
        bg-surface-raised wrapper
      </p>
      <Surface variant="surface" padding="md">
        <p className="text-sm text-text">
          A surface card nested on a raised background — the subtle border shows the elevation
          contrast between tokens.
        </p>
      </Surface>
    </div>
  ),
};
