import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator, Swatch, SwatchGroup } from './_doc-components';

const meta = {
  parameters: { layout: 'padded', backgrounds: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ColorsPage() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-text">Colors</h1>
      <p className="mb-2 max-w-2xl text-sm leading-relaxed text-text-muted">
        Decksmith&apos;s palette is warm and intentional —{' '}
        <strong className="font-semibold text-text">never a flat corporate SaaS grey</strong>. Two
        families that never mix:{' '}
        <strong className="font-semibold text-text">semantic tokens</strong> (surfaces, text,
        accent, status) and <strong className="font-semibold text-text">MTG color identity</strong>{' '}
        (WUBRG). Toggle the theme in the toolbar to see how each token adapts.
      </p>
      <p className="mb-10 font-mono text-xs text-text-faint">
        All tokens →{' '}
        <code className="rounded-sm bg-surface-raised px-1.5 py-0.5 text-text-muted">
          packages/tokens/src/web/tokens.css
        </code>{' '}
        · Use only semantic names in components — never hardcode hex.
      </p>

      <Separator />

      <SwatchGroup
        title="SURFACES & BACKGROUNDS"
        description="The warm purple-black / parchment base. Every surface is a step above the one below it."
        cols={4}
      >
        <Swatch token="bg" bg="bg-bg" usage="Page background — the canvas everything sits on" />
        <Swatch token="surface" bg="bg-surface" usage="Cards, panels, sidebars" />
        <Swatch
          token="surface-raised"
          bg="bg-surface-raised"
          usage="Elevated surfaces, nested panels"
        />
        <Swatch
          token="surface-hover"
          bg="bg-surface-hover"
          usage="Hover state on interactive surfaces"
        />
      </SwatchGroup>

      <SwatchGroup title="BORDERS" cols={3}>
        <Swatch token="border" bg="bg-border" usage="Card and panel edges, field outlines" />
        <Swatch
          token="border-subtle"
          bg="bg-border-subtle"
          usage="Section dividers, list separators"
        />
        <Swatch
          token="border-focus"
          bg="bg-border-focus"
          usage="Focus rings — amber in dark, violet in light"
        />
      </SwatchGroup>

      <Separator />

      <SwatchGroup
        title="TEXT"
        description="Shown as colored text on a surface background. text-faint is decorative only — it fails WCAG AA and must never be used for readable content."
        cols={2}
      >
        <Swatch token="text" text="text-text" usage="Primary body and heading text" />
        <Swatch
          token="text-muted"
          text="text-text-muted"
          usage="Secondary text, labels, captions"
        />
        <Swatch
          token="text-faint"
          text="text-text-faint"
          usage="Ornamental only — fails AA (2.5:1). Never for content."
          warn="decorative only"
        />
        <Swatch
          token="accent-text"
          text="text-accent-text"
          usage="Accent-colored inline text — passes WCAG AA in both modes"
        />
      </SwatchGroup>

      <Separator />

      <SwatchGroup
        title="INTERACTIVE ACCENT"
        description="Mode-specific by design. Dark mode: amber (#e8b84b) — warm, crafted. Light mode: violet (#5b4fcf) — contrast on parchment. Never substitute brand amber for the interactive accent in light mode."
        cols={3}
      >
        <Swatch
          token="accent"
          bg="bg-accent"
          usage="Primary buttons, active nav, selected states"
        />
        <Swatch
          token="accent-hover"
          bg="bg-accent-hover"
          usage="Accent button hover — slightly deeper"
        />
        <Swatch
          token="accent-subtle"
          bg="bg-accent-subtle"
          usage="Subtle tint, selected item backgrounds"
        />
        <Swatch
          token="accent-border"
          bg="bg-accent-border"
          usage="Focused borders, hover glow ring"
        />
        <Swatch
          token="on-accent"
          bg="bg-on-accent"
          usage="Text ON accent buttons — dark on amber, white on violet"
        />
      </SwatchGroup>

      <SwatchGroup
        title="BRAND AMBER"
        description="Amber is the brand identity color. In dark mode it doubles as the interactive accent. In light mode it is decorative only — fails AA on the parchment background."
        cols={2}
      >
        <Swatch
          token="brand"
          bg="bg-brand"
          usage="Logo mark ◈, ornaments, ─────◈───── separators. Not for interactive UI in light mode."
          warn="decorative only"
        />
      </SwatchGroup>

      <Separator />

      <SwatchGroup
        title="STATUS — ERROR"
        description="Use -subtle for backgrounds, -text for readable text, and the base token for icons and borders."
        cols={3}
      >
        <Swatch token="error" bg="bg-error" usage="Error icons, borders, destructive actions" />
        <Swatch token="error-subtle" bg="bg-error-subtle" usage="Error message background" />
        <Swatch
          token="error-text"
          text="text-error-text"
          usage="Error message text — accessible on error-subtle"
        />
      </SwatchGroup>

      <SwatchGroup title="STATUS — SUCCESS" cols={3}>
        <Swatch token="success" bg="bg-success" usage="Owned cards, full coverage indicator" />
        <Swatch token="success-subtle" bg="bg-success-subtle" usage="Success message background" />
        <Swatch token="success-text" text="text-success-text" usage="Success message text" />
      </SwatchGroup>

      <SwatchGroup title="STATUS — WARNING" cols={3}>
        <Swatch token="warning" bg="bg-warning" usage="Partial coverage, caution states" />
        <Swatch token="warning-subtle" bg="bg-warning-subtle" usage="Warning message background" />
        <Swatch token="warning-text" text="text-warning-text" usage="Warning message text" />
      </SwatchGroup>

      <SwatchGroup title="STATUS — INFO" cols={3}>
        <Swatch token="info" bg="bg-info" usage="Informational indicators, neutral notifications" />
        <Swatch token="info-subtle" bg="bg-info-subtle" usage="Info message background" />
        <Swatch token="info-text" text="text-info-text" usage="Info message text" />
      </SwatchGroup>

      <div className="mb-10 rounded-surface border border-border bg-surface px-4 py-3 font-mono text-xs text-text-muted">
        <code>info</code> ≠ <code>mtg-blue</code> — these tokens represent different things. Never
        substitute one for the other.
      </div>

      <Separator />

      <SwatchGroup
        title="MTG COLOR IDENTITY (WUBRG)"
        description="Game color identity — used for mana symbols, deck color indicators, filters, and distribution charts. Completely separate from semantic tokens. mtg-red ≠ error."
        cols={4}
      >
        <Swatch
          token="mtg-white"
          bg="bg-mtg-white"
          usage="Plains — only WUBRG color with a dark/light variant"
        />
        <Swatch token="mtg-blue" bg="bg-mtg-blue" usage="Island — stable across modes" />
        <Swatch token="mtg-black" bg="bg-mtg-black" usage="Swamp — stable across modes" />
        <Swatch token="mtg-red" bg="bg-mtg-red" usage="Mountain — stable across modes" />
        <Swatch token="mtg-green" bg="bg-mtg-green" usage="Forest — stable across modes" />
        <Swatch token="mtg-colorless" bg="bg-mtg-colorless" usage="Colorless / artifact mana" />
        <Swatch
          token="mtg-multi"
          bg="bg-mtg-multi"
          usage="Multicolor / gold — two or more colors"
        />
      </SwatchGroup>
    </div>
  );
}

export const Page: Story = {
  name: 'Colors',
  render: () => <ColorsPage />,
};
