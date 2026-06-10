import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator, SectionLabel, ShadowCard } from './_doc-components';

const meta = {
  parameters: { layout: 'padded', backgrounds: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ShadowsPage() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-text">Shadows</h1>
      <p className="mb-2 max-w-2xl text-sm leading-relaxed text-text-muted">
        Components use <strong className="font-semibold text-text">semantic roles</strong>, never
        the raw scale. Three elevation levels and one accent glow — the scale is intentionally dark
        and punchy to read on the warm-dark canvas. The accent glow is mode-specific: violet in
        light, amber in dark.
      </p>
      <p className="mb-10 font-mono text-xs text-text-faint">
        Toggle the theme to see{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 text-text-muted">
          shadow-accent
        </code>{' '}
        switch between violet and amber glow.
      </p>

      <Separator />

      <section className="mb-10">
        <SectionLabel>SEMANTIC ROLES — USE THESE IN COMPONENTS</SectionLabel>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          Pick the role that matches the component&apos;s context. Standard card hover:{' '}
          <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
            shadow-card + shadow-accent
          </code>
          .
        </p>
        <div className="grid grid-cols-4 gap-8">
          <ShadowCard
            token="shadow-popover"
            value="= shadow-sm"
            cssValue="var(--shadow-popover)"
            usage="Tooltips, small dropdowns, hints"
          />
          <ShadowCard
            token="shadow-card"
            value="= shadow-md"
            cssValue="var(--shadow-card)"
            usage="Cards, panels, menus — the default surface shadow"
          />
          <ShadowCard
            token="shadow-overlay"
            value="= shadow-lg"
            cssValue="var(--shadow-overlay)"
            usage="Modals, drawers, overlays — maximum elevation"
          />
          <ShadowCard
            token="shadow-accent"
            value="mode-specific glow"
            cssValue="var(--shadow-accent)"
            usage="Hover / focus glow on interactive surfaces"
          />
        </div>
      </section>

      <section className="mb-10">
        <SectionLabel>COMBINED — CARD HOVER STATE</SectionLabel>
        <div className="grid grid-cols-2 gap-8">
          <ShadowCard
            token="shadow-card"
            value="resting state"
            cssValue="var(--shadow-card)"
            usage="Default card at rest"
          />
          <ShadowCard
            token="shadow-card + shadow-accent"
            value="hover / focus state"
            cssValue="var(--shadow-card), var(--shadow-accent)"
            usage="Elevated card on hover — depth + glow together"
          />
        </div>
      </section>

      <Separator />

      <section className="mb-10">
        <SectionLabel>SCALE — REFERENCE ONLY</SectionLabel>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          Do not use scale tokens in components. They back the semantic roles above.
        </p>
        <div className="grid grid-cols-3 gap-8">
          <ShadowCard
            token="shadow-sm"
            value="scale reference"
            cssValue="var(--shadow-sm)"
            usage="= shadow-popover"
          />
          <ShadowCard
            token="shadow-md"
            value="scale reference"
            cssValue="var(--shadow-md)"
            usage="= shadow-card"
          />
          <ShadowCard
            token="shadow-lg"
            value="scale reference"
            cssValue="var(--shadow-lg)"
            usage="= shadow-overlay"
          />
        </div>
      </section>
    </div>
  );
}

export const Page: Story = {
  name: 'Shadows',
  render: () => <ShadowsPage />,
};
