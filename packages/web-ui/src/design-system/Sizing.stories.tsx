import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator, SectionLabel } from './_doc-components';

const meta = {
  parameters: { layout: 'padded', backgrounds: { disable: true }, a11y: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type SizeRowProps = {
  label: string;
  twClass: string;
  px: string;
  usage: string;
  square?: boolean;
};

function SizeRow({ label, twClass, px, usage, square }: SizeRowProps) {
  const pxValue = Number.parseInt(px, 10);

  return (
    <div className="flex items-center gap-6 border-b border-border-subtle py-3 last:border-0">
      <span className="w-8 shrink-0 font-mono text-xs font-semibold text-accent-text">{label}</span>
      <div
        className="shrink-0 rounded-interactive border-2 border-accent-border bg-accent-subtle"
        style={
          square
            ? { width: pxValue, height: pxValue }
            : { width: Math.min(pxValue * 3, 200), height: pxValue }
        }
      />
      <div className="flex min-w-0 flex-1 gap-4">
        <span className="w-20 shrink-0 font-mono text-xs text-text">{twClass}</span>
        <span className="w-12 shrink-0 font-mono text-xs text-text-faint">{px}</span>
        <span className="text-xs text-text-muted">{usage}</span>
      </div>
    </div>
  );
}

function SizingPage() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-text">Sizing</h1>
      <p className="mb-2 max-w-2xl text-sm leading-relaxed text-text-muted">
        Control heights, square sizes, and icon sizes are{' '}
        <strong className="font-semibold text-text">not CSS tokens</strong> — they are shared{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">cva</code> maps
        in{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
          packages/web-ui/src/lib/sizing/
        </code>
        .
      </p>
      <p className="mb-10 font-mono text-xs text-text-muted">
        Why: Tailwind v4 has no{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 text-text-muted">--size-*</code>{' '}
        namespace · using{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 text-text-muted">
          --spacing-*
        </code>{' '}
        would leak to{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 text-text-muted">p-*</code> /{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 text-text-muted">gap-*</code> ·
        see ADR-0017
      </p>

      <Separator />

      <section className="mb-10">
        <SectionLabel>CONTROL_HEIGHT — interactive controls</SectionLabel>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          Single source of truth for the vertical rhythm of all interactive controls: buttons,
          inputs, selects, toggles. Every control at the same size key is identical in height.
        </p>
        <SizeRow label="xs" twClass="h-6" px="24px" usage="Compact toolbars, dense tables" />
        <SizeRow label="sm" twClass="h-8" px="32px" usage="Secondary actions, inline controls" />
        <SizeRow
          label="md"
          twClass="h-9"
          px="36px"
          usage="Default — buttons, inputs, selects (most components)"
        />
        <SizeRow label="lg" twClass="h-11" px="44px" usage="Touch targets, prominent CTAs" />
      </section>

      <Separator />

      <section className="mb-10">
        <SectionLabel>CONTROL_SQUARE — icon-only controls</SectionLabel>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          Square tap targets for icon-only controls (
          <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
            IconButton
          </code>
          ,{' '}
          <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
            IconToggle
          </code>
          ). Uses{' '}
          <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">size-*</code>{' '}
          (sets both width and height). Matches CONTROL_HEIGHT exactly so icon-only controls align
          with text controls at the same size key.
        </p>
        <SizeRow label="xs" twClass="size-6" px="24px" usage="Dense toolbars" square />
        <SizeRow label="sm" twClass="size-8" px="32px" usage="Inline icon actions" square />
        <SizeRow
          label="md"
          twClass="size-9"
          px="36px"
          usage="Default — aligns with md text controls"
          square
        />
        <SizeRow
          label="lg"
          twClass="size-11"
          px="44px"
          usage="Touch-friendly primary icon CTA"
          square
        />
      </section>

      <Separator />

      <section className="mb-10">
        <SectionLabel>ICON_SIZE — inline icons and indicators</SectionLabel>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          For decorative icons that sit inline within text or UI chrome — mana pips, rarity badges,
          avatars. These are smaller than interactive controls and are{' '}
          <strong className="font-semibold text-text">never standalone tap targets</strong>.
        </p>
        <SizeRow
          label="xs"
          twClass="size-3.5"
          px="14px"
          usage="Menu items, inline with text-sm"
          square
        />
        <SizeRow
          label="sm"
          twClass="size-4"
          px="16px"
          usage="Mana pips, compact indicators"
          square
        />
        <SizeRow
          label="md"
          twClass="size-5"
          px="20px"
          usage="Default — rarity badges, inline icons"
          square
        />
        <SizeRow label="lg" twClass="size-6" px="24px" usage="Prominent icons, avatars" square />
      </section>

      <Separator />

      <section className="mb-10">
        <SectionLabel>USAGE IN CVA</SectionLabel>
        <p className="mb-4 text-sm leading-relaxed text-text-muted">
          Import the map and spread values into cva size variants. The literal strings are visible
          to the Tailwind scanner at build time.
        </p>
        <pre className="overflow-x-auto rounded-surface bg-surface-raised p-6 font-mono text-xs leading-relaxed text-text-muted">
          <code>{`import { CONTROL_HEIGHT } from '../../lib/sizing/control-height';

const button = cva('inline-flex items-center rounded-interactive', {
  variants: {
    size: {
      xs: \`\${CONTROL_HEIGHT.xs} px-2 text-xs gap-1\`,
      sm: \`\${CONTROL_HEIGHT.sm} px-3 text-sm gap-1.5\`,
      md: \`\${CONTROL_HEIGHT.md} px-4 text-sm gap-2\`,
      lg: \`\${CONTROL_HEIGHT.lg} px-6 text-base gap-2\`,
    },
  },
  defaultVariants: { size: 'md' },
});`}</code>
        </pre>
      </section>
    </div>
  );
}

export const Page: Story = {
  name: 'Sizing',
  render: () => <SizingPage />,
};
