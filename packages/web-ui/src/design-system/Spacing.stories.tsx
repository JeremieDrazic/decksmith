import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator, SectionLabel, SpacingRow } from './_doc-components';

const meta = {
  parameters: { layout: 'padded', backgrounds: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type UsageRowProps = {
  range: string;
  usage: string;
  examples: string;
};

function UsageRow({ range, usage, examples }: UsageRowProps) {
  return (
    <div className="flex gap-6 border-b border-border-subtle py-4 last:border-0">
      <span className="w-24 shrink-0 font-mono text-xs text-accent-text">{range}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">{usage}</p>
        <p className="mt-0.5 text-xs text-text-muted">{examples}</p>
      </div>
    </div>
  );
}

function SpacingPage() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-text">Spacing</h1>
      <p className="mb-2 max-w-2xl text-sm leading-relaxed text-text-muted">
        4px base grid — every spacing value is a multiple of 4. No custom scale: Decksmith uses
        Tailwind's default spacing directly. Consistent rhythm across all components.
      </p>
      <p className="mb-10 font-mono text-xs text-text-faint">
        1 Tailwind unit = 4px ·{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 text-text-muted">p-4</code> = 16px
        · <code className="rounded-sm bg-surface-raised px-1 py-0.5 text-text-muted">gap-2</code> =
        8px
      </p>

      <Separator />

      <section className="mb-10">
        <SectionLabel>FULL SCALE</SectionLabel>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          The bar width is proportional to the spacing value. All 13 steps used in Decksmith.
        </p>
        <SpacingRow size="4" px="4px" tailwind="p-1 · gap-1 · m-1" />
        <SpacingRow size="8" px="8px" tailwind="p-2 · gap-2 · m-2" />
        <SpacingRow size="12" px="12px" tailwind="p-3 · gap-3 · m-3" />
        <SpacingRow size="16" px="16px" tailwind="p-4 · gap-4 · m-4" />
        <SpacingRow size="20" px="20px" tailwind="p-5 · gap-5 · m-5" />
        <SpacingRow size="24" px="24px" tailwind="p-6 · gap-6 · m-6" />
        <SpacingRow size="32" px="32px" tailwind="p-8 · gap-8 · m-8" />
        <SpacingRow size="40" px="40px" tailwind="p-10 · gap-10 · m-10" />
        <SpacingRow size="48" px="48px" tailwind="p-12 · gap-12 · m-12" />
        <SpacingRow size="64" px="64px" tailwind="p-16 · gap-16 · m-16" />
        <SpacingRow size="80" px="80px" tailwind="p-20 · gap-20 · m-20" />
        <SpacingRow size="96" px="96px" tailwind="p-24 · gap-24 · m-24" />
        <SpacingRow size="128" px="128px" tailwind="p-32 · gap-32 · m-32" />
      </section>

      <Separator />

      <section className="mb-10">
        <SectionLabel>SEMANTIC USAGE</SectionLabel>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          Not every step has a fixed role, but these patterns repeat across all Decksmith screens.
        </p>
        <UsageRow
          range="4–8px"
          usage="Micro — inline gaps, icon-to-label"
          examples="Icon + label in a button, badge padding, dot indicator gap"
        />
        <UsageRow
          range="12–16px"
          usage="Component — internal padding"
          examples="Card body padding, input padding, list item vertical padding"
        />
        <UsageRow
          range="20–24px"
          usage="Component — between elements"
          examples="Between form fields, between card sections, sidebar item gap"
        />
        <UsageRow
          range="32–48px"
          usage="Section — between components"
          examples="Between page sections, grid gap in card inventory, drawer padding"
        />
        <UsageRow
          range="64–96px"
          usage="Layout — page-level breathing room"
          examples="Page top/bottom padding, hero section vertical rhythm"
        />
        <UsageRow
          range="128px"
          usage="Layout — maximum separation"
          examples="Above-the-fold hero height, large empty state vertical centering"
        />
      </section>
    </div>
  );
}

export const Page: Story = {
  name: 'Spacing',
  render: () => <SpacingPage />,
};
