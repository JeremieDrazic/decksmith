import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator, SectionLabel, RadiusBlock } from './_doc-components';

const meta = {
  parameters: { layout: 'padded', backgrounds: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function RadiusPage() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-text">
        Border Radius
      </h1>
      <p className="mb-2 max-w-2xl text-sm leading-relaxed text-text-muted">
        Components always use a <strong className="font-semibold text-text">semantic role</strong>,
        never a scale token directly. Four roles cover every UI context — interactive elements,
        surfaces, modals, and pills. The scale exists as a reference and for one documented
        exception.
      </p>
      <p className="mb-10 font-mono text-xs text-text-faint">
        Rule:{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 text-text-muted">
          radius-interactive
        </code>{' '}
        /{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 text-text-muted">
          radius-surface
        </code>{' '}
        /{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 text-text-muted">
          radius-modal
        </code>{' '}
        /{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 text-text-muted">
          radius-badge
        </code>{' '}
        — one rule per context, no drift.
      </p>

      <Separator />

      <section className="mb-10">
        <SectionLabel>SEMANTIC ROLES — USE THESE IN COMPONENTS</SectionLabel>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          Pick the role that matches the component&apos;s context. Never pick a value because it
          &ldquo;looks right&rdquo; — match the role.
        </p>
        <div className="grid grid-cols-4 gap-6">
          <RadiusBlock
            token="radius-interactive"
            value="8px (0.5rem)"
            cssValue="0.5rem"
            usage="Buttons, inputs, selects, toggles, checkboxes"
            semantic
          />
          <RadiusBlock
            token="radius-surface"
            value="12px (0.75rem)"
            cssValue="0.75rem"
            usage="Cards, panels, popovers, tooltips, dropdowns"
            semantic
          />
          <RadiusBlock
            token="radius-modal"
            value="16px (1rem)"
            cssValue="1rem"
            usage="Modals, dialogs, drawers, bottom sheets"
            semantic
          />
          <RadiusBlock
            token="radius-badge"
            value="9999px"
            cssValue="9999px"
            usage="Pills, tags, avatars, mana symbol backgrounds, dots"
            semantic
          />
        </div>
      </section>

      <Separator />

      <section className="mb-10">
        <SectionLabel>SCALE — REFERENCE ONLY</SectionLabel>
        <p className="mb-6 text-sm leading-relaxed text-text-muted">
          Do not use scale tokens in components. They exist to define semantic roles and for the one
          documented exception below.
        </p>
        <div className="grid grid-cols-4 gap-6">
          <RadiusBlock
            token="radius-sm"
            value="4px (0.25rem)"
            cssValue="0.25rem"
            usage="See exception below"
          />
          <RadiusBlock
            token="radius-md"
            value="8px (0.5rem)"
            cssValue="0.5rem"
            usage="= radius-interactive"
          />
          <RadiusBlock
            token="radius-lg"
            value="12px (0.75rem)"
            cssValue="0.75rem"
            usage="= radius-surface"
          />
          <RadiusBlock
            token="radius-xl"
            value="16px (1rem)"
            cssValue="1rem"
            usage="= radius-modal"
          />
          <RadiusBlock
            token="radius-2xl"
            value="24px (1.5rem)"
            cssValue="1.5rem"
            usage="Not mapped to a role"
          />
          <RadiusBlock
            token="radius-full"
            value="9999px"
            cssValue="9999px"
            usage="= radius-badge"
          />
        </div>
      </section>

      <Separator />

      <section className="mb-10">
        <SectionLabel>EXCEPTION — STAMP / SEAL ELEMENTS</SectionLabel>
        <div className="flex gap-8">
          <div className="flex-1">
            <p className="mb-4 text-sm leading-relaxed text-text-muted">
              <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs text-text-muted">
                radius-sm
              </code>{' '}
              (4px) is allowed for MTG format badges and rarity chips. These elements intentionally
              look crisp and printed — like a physical stamp — rather than rounded. An inline
              comment is required when used.
            </p>
            <div className="flex flex-wrap gap-3">
              <span
                className="border border-border bg-surface-raised px-2 py-0.5 font-mono text-xs text-text-muted"
                style={{ borderRadius: '0.25rem' }}
              >
                {/* radius-sm — stamp element */}
                Commander
              </span>
              <span
                className="border border-border bg-surface-raised px-2 py-0.5 font-mono text-xs text-text-muted"
                style={{ borderRadius: '0.25rem' }}
              >
                {/* radius-sm — stamp element */}
                Rare
              </span>
              <span
                className="border border-border bg-surface-raised px-2 py-0.5 font-mono text-xs text-text-muted"
                style={{ borderRadius: '0.25rem' }}
              >
                {/* radius-sm — stamp element */}
                Standard
              </span>
            </div>
          </div>
          <div className="w-48 shrink-0">
            <RadiusBlock
              token="radius-sm"
              value="4px (0.25rem)"
              cssValue="0.25rem"
              usage="MTG format badges, rarity chips only"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export const Page: Story = {
  name: 'Radius',
  render: () => <RadiusPage />,
};
