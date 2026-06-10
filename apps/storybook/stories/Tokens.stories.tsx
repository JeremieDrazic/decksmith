import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Design System/Tokens',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Swatch({ label, bg, text }: { label: string; bg: string; text?: string }) {
  return (
    <div className={`${bg} rounded-surface border border-border p-3`}>
      <span className={`text-xs font-mono ${text ?? 'text-text'}`}>{label}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <p className="text-text-muted text-xs font-mono uppercase tracking-widest mb-3">{title}</p>
      <div className="grid grid-cols-4 gap-2">{children}</div>
    </section>
  );
}

function TokenShowcase() {
  return (
    <div className="p-8 font-sans">
      <h1 className="text-text text-2xl font-semibold mb-2">Design Tokens</h1>
      <p className="text-text-muted text-sm mb-8">Toggle dark / light with the toolbar button.</p>

      <Section title="Backgrounds">
        <Swatch label="bg" bg="bg-bg" />
        <Swatch label="surface" bg="bg-surface" />
        <Swatch label="surface-raised" bg="bg-surface-raised" />
        <Swatch label="surface-hover" bg="bg-surface-hover" />
      </Section>

      <Section title="Accent">
        <Swatch label="accent" bg="bg-accent" text="text-on-accent" />
        <Swatch label="accent-hover" bg="bg-accent-hover" text="text-on-accent" />
        <Swatch label="accent-subtle" bg="bg-accent-subtle" />
        <Swatch label="brand" bg="bg-brand" text="text-on-accent" />
      </Section>

      <Section title="Text">
        <Swatch label="text" bg="bg-surface" text="text-text" />
        <Swatch label="text-muted" bg="bg-surface" text="text-text-muted" />
        <Swatch label="text-faint" bg="bg-surface" text="text-text-faint" />
        <Swatch label="accent-text" bg="bg-surface" text="text-accent-text" />
      </Section>

      <Section title="Status">
        <Swatch label="error" bg="bg-error-subtle" text="text-error-text" />
        <Swatch label="success" bg="bg-success-subtle" text="text-success-text" />
        <Swatch label="warning" bg="bg-warning-subtle" text="text-warning-text" />
        <Swatch label="info" bg="bg-info-subtle" text="text-info-text" />
      </Section>

      <Section title="MTG Colors">
        <Swatch label="mtg-white" bg="bg-mtg-white" text="text-on-accent" />
        <Swatch label="mtg-blue" bg="bg-mtg-blue" text="text-on-accent" />
        <Swatch label="mtg-black" bg="bg-mtg-black" text="text-on-accent" />
        <Swatch label="mtg-red" bg="bg-mtg-red" text="text-on-accent" />
        <Swatch label="mtg-green" bg="bg-mtg-green" text="text-on-accent" />
        <Swatch label="mtg-colorless" bg="bg-mtg-colorless" text="text-on-accent" />
        <Swatch label="mtg-multi" bg="bg-mtg-multi" text="text-on-accent" />
      </Section>
    </div>
  );
}

export const Colors: Story = {
  render: () => <TokenShowcase />,
};
