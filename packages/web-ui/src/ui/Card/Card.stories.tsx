import type { Meta, StoryObj } from '@storybook/react-vite';

import { Eyebrow } from '../../typography/Eyebrow';
import { Heading } from '../../typography/Heading';
import { Text } from '../../typography/Text';
import { Card } from './Card';

const meta = {
  title: 'Components/UI/Card',
  component: Card,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <Card className="w-72" {...args}>
      <p className="text-sm text-text">Card content</p>
    </Card>
  ),
};

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Card className="w-72">
      <p className="text-sm text-text">A default card with surface background and shadow.</p>
    </Card>
  ),
};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4 items-start">
      <Card variant="surface" className="w-52">
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-wide mb-1">
          surface
        </p>
        <p className="text-sm text-text">Default. Sits on page bg.</p>
      </Card>
      <Card variant="raised" className="w-52">
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-wide mb-1">raised</p>
        <p className="text-sm text-text">Sits on a surface context.</p>
      </Card>
    </div>
  ),
};

// ─── Padding ──────────────────────────────────────────────────────────────────

export const Padding: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 items-start">
      {(['sm', 'md', 'lg'] as const).map((p) => (
        <div key={p} className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-wide">
            padding=&quot;{p}&quot;
          </span>
          <Card padding={p} className="w-36">
            <span className="block text-xs text-text-muted">Content</span>
          </Card>
        </div>
      ))}
    </div>
  ),
};

// ─── Composed ─────────────────────────────────────────────────────────────────

export const Composed: Story = {
  render: () => (
    <Card className="w-72">
      <div className="flex flex-col gap-2">
        <Eyebrow>Commander</Eyebrow>
        <Heading as="h3" size="xl">
          Gruul Aggro
        </Heading>
        <Text tone="muted" size="sm">
          47 cards · 2 missing · $86 estimated
        </Text>
      </div>
    </Card>
  ),
};
