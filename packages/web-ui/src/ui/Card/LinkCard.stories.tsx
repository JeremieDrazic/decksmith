import type { Meta, StoryObj } from '@storybook/react-vite';

import { LinkCard } from './Card';

const meta = {
  title: 'Components/UI/LinkCard',
  component: LinkCard,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof LinkCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  parameters: { controls: { disable: false } },
  render: (args) => (
    <LinkCard href="#" className="w-72" {...args}>
      <p className="text-sm text-text">Hover to see the lift + glow effect.</p>
    </LinkCard>
  ),
};

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <LinkCard href="#" className="w-72">
      <p className="text-sm text-text font-medium">Deck title</p>
      <p className="text-xs text-text-muted mt-0.5">47 cards · Commander</p>
    </LinkCard>
  ),
};

// ─── RecentActivity ───────────────────────────────────────────────────────────

const ACTIVITY_ITEMS = [
  { initials: 'JD', name: 'Added 3 cards', sub: 'Lightning Bolt × 3 → Burn deck', time: '2m' },
  { initials: 'JD', name: 'Created new deck', sub: 'Gruul Aggro — Standard', time: '1h' },
  { initials: 'JD', name: 'Updated valuation', sub: '47 cards · $312 total', time: '3h' },
];

export const RecentActivity: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-80">
      {ACTIVITY_ITEMS.map((item) => (
        <LinkCard key={item.name} href="#" padding="sm">
          <div className="flex items-center gap-3">
            <div className="size-8 shrink-0 rounded-full bg-accent-subtle flex items-center justify-center">
              <span className="font-mono text-xs font-semibold text-accent-text">
                {item.initials}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text truncate">{item.name}</p>
              <p className="text-xs text-text-muted truncate">{item.sub}</p>
            </div>
            <span className="shrink-0 font-mono text-xs text-text-muted">{item.time}</span>
          </div>
        </LinkCard>
      ))}
    </div>
  ),
};

// ─── WithRender ───────────────────────────────────────────────────────────────
// Demonstrates the render prop for SPA client-side navigation.
// In apps/web, replace <a href="…"> with <Link to="…" params={…} /> from TanStack Router
// to prevent full page reloads:
//   <LinkCard render={<Link to="/decks/$id" params={{ id: deck.id }} />}>…</LinkCard>
//
// a11y intentionally disabled: the render prop is a tag swapper — the bare <a> element
// receives its content and href from the consumer at render time via useRender props.

export const WithRender: Story = {
  parameters: { a11y: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 w-72">
      <div>
        <p className="font-mono text-[10px] text-text-faint uppercase tracking-wide mb-2">
          Default — native &lt;a&gt;
        </p>
        <LinkCard href="#" padding="sm">
          <p className="text-sm text-text font-medium">Deck title</p>
          <p className="text-xs text-text-muted">Renders a native anchor element</p>
        </LinkCard>
      </div>
      <div>
        <p className="font-mono text-[10px] text-text-faint uppercase tracking-wide mb-2">
          render prop — custom element
        </p>
        {/* In apps/web: render={(props) => <Link to="/decks/$id" params={{ id: deck.id }} {...props} />} */}
        <LinkCard
          render={(props) => <a href="/decks/example" aria-label="Example deck link" {...props} />}
          padding="sm"
        >
          <p className="text-sm text-text font-medium">Deck title</p>
          <p className="text-xs text-text-muted">Custom element via render prop</p>
        </LinkCard>
      </div>
    </div>
  ),
};
