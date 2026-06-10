import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator, SectionLabel, TypeRow, TrackingRow } from './_doc-components';

const meta = {
  parameters: { layout: 'padded', backgrounds: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type WeightRowProps = {
  weightClass: string;
  numeric: string;
  label: string;
  usage: string;
};

function WeightRow({ weightClass, numeric, label, usage }: WeightRowProps) {
  return (
    <div className="flex items-baseline gap-6 border-b border-border-subtle py-5 last:border-0">
      <div className="w-40 shrink-0">
        <p className="font-mono text-xs text-text">{label}</p>
        <p className="font-mono text-xs text-text-faint">{numeric}</p>
      </div>
      <span className={`min-w-0 flex-1 font-display text-2xl text-text ${weightClass}`}>
        Build decks deliberately
      </span>
      <span className="w-40 shrink-0 text-right text-xs text-text-muted">{usage}</span>
    </div>
  );
}

function TypographyPage() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-text">Typography</h1>
      <p className="mb-2 max-w-2xl text-sm leading-relaxed text-text-muted">
        Two fonts, one family. <strong className="font-semibold text-text">Outfit</strong> covers
        all display and body roles — warm, geometric, readable at every weight.{' '}
        <strong className="font-semibold text-text">JetBrains Mono</strong> handles numbers and
        data: card counts, prices, mana costs. Both are self-hosted with{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
          font-display: optional
        </code>{' '}
        — no FOUT, no layout shift.
      </p>
      <p className="mb-10 font-mono text-xs text-text-faint">
        Scale is fluid —{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 text-text-muted">
          clamp(min, preferred, max)
        </code>{' '}
        · px ranges shown at 375px → 1280px viewport.
      </p>

      <Separator />

      <section className="mb-10">
        <SectionLabel>TYPE SCALE — DISPLAY (Outfit)</SectionLabel>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          Used for headings, navigation, labels, and body text.{' '}
          <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
            font-display
          </code>{' '}
          ·{' '}
          <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
            tracking-tight
          </code>{' '}
          on headings (xl and above).
        </p>
        <TypeRow step="xs" px="11–12px" leading="1.5" sample="Format: Commander · 100 cards" />
        <TypeRow
          step="sm"
          px="13–14px"
          leading="1.5"
          sample="Added 3 Lightning Bolts to your collection"
        />
        <TypeRow step="base" px="15–17px" leading="1.6" sample="Build decks deliberately" />
        <TypeRow step="lg" px="17–20px" leading="1.5" sample="Your collection at a glance" />
        <TypeRow step="xl" px="19–22px" leading="1.4" sample="Search cards, build decks" />
        <TypeRow step="2xl" px="22–26px" leading="1.3" sample="My Collection" />
        <TypeRow step="3xl" px="26–32px" leading="1.2" sample="Deck Builder" />
        <TypeRow step="4xl" px="30–40px" leading="1.1" sample="Decksmith" />
      </section>

      <section className="mb-10">
        <SectionLabel>TYPE SCALE — MONO (JetBrains Mono)</SectionLabel>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          Reserved for numbers, stats, and data.{' '}
          <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
            font-mono
          </code>{' '}
          · Never use for prose — Outfit at the same size reads better.
        </p>
        <TypeRow step="xs" px="11–12px" leading="1.5" sample="0000 · 0000 · 0000" mono />
        <TypeRow step="sm" px="13–14px" leading="1.5" sample="42 cards · 128.50 €" mono />
        <TypeRow step="base" px="15–17px" leading="1.6" sample="2UG · CMC 3 · P/T 2/3" mono />
        <TypeRow step="lg" px="17–20px" leading="1.5" sample="142.80 € total value" mono />
        <TypeRow step="xl" px="19–22px" leading="1.4" sample="60 / 100 cards" mono />
      </section>

      <Separator />

      <section className="mb-10">
        <SectionLabel>FONT WEIGHTS</SectionLabel>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          Outfit ships with 5 usable weights. Use the semantic role, not the number.
        </p>
        <WeightRow
          weightClass="font-normal"
          numeric="400"
          label="font-normal"
          usage="Body copy, secondary content"
        />
        <WeightRow
          weightClass="font-medium"
          numeric="500"
          label="font-medium"
          usage="Emphasized body, nav links"
        />
        <WeightRow
          weightClass="font-semibold"
          numeric="600"
          label="font-semibold"
          usage="Labels, subheadings, buttons"
        />
        <WeightRow
          weightClass="font-bold"
          numeric="700"
          label="font-bold"
          usage="Section headings"
        />
        <WeightRow
          weightClass="font-extrabold"
          numeric="800"
          label="font-extrabold"
          usage="Display headings, hero text"
        />
      </section>

      <Separator />

      <section className="mb-10">
        <SectionLabel>LETTER SPACING</SectionLabel>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          Three steps. Tight on headings, wide on uppercase labels.{' '}
          <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
            tracking-normal
          </code>{' '}
          is implicit for body — set it explicitly only when overriding a tighter context.
        </p>
        <TrackingRow token="tracking-tight" value="-0.02em" usage="Headings (xl and above)" />
        <TrackingRow token="tracking-normal" value="0em" usage="Body text, default" />
        <TrackingRow
          token="tracking-wide"
          value="0.04em"
          usage="Uppercase labels, section metadata"
        />
      </section>
    </div>
  );
}

export const Page: Story = {
  name: 'Typography',
  render: () => <TypographyPage />,
};
