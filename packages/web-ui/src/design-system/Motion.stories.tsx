import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator, SectionLabel, MotionDemo } from './_doc-components';

const meta = {
  parameters: { layout: 'padded', backgrounds: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type TokenRowProps = {
  token: string;
  value: string;
  usage: string;
};

function TokenRow({ token, value, usage }: TokenRowProps) {
  return (
    <div className="flex items-center gap-6 border-b border-border-subtle py-3.5 last:border-0">
      <span className="w-48 shrink-0 font-mono text-xs text-text">--{token}</span>
      <span className="w-24 shrink-0 font-mono text-xs text-text-faint">{value}</span>
      <span className="text-xs text-text-muted">{usage}</span>
    </div>
  );
}

function MotionPage() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-text">Motion</h1>
      <p className="mb-10 max-w-2xl text-sm leading-relaxed text-text-muted">
        Two motion modes: <strong className="font-semibold text-text">Micro</strong> for instant
        feedback (hover, press, toggle), and{' '}
        <strong className="font-semibold text-text">Key moments</strong> for meaningful transitions
        (modal, card add, builder open). All durations collapse to{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">0ms</code>{' '}
        under{' '}
        <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
          prefers-reduced-motion
        </code>
        .
      </p>

      <Separator />

      <section className="mb-10">
        <SectionLabel>INTERACTIVE DEMOS — click to toggle</SectionLabel>
        <div className="mt-6 grid grid-cols-3 gap-8">
          <MotionDemo
            label="Micro A — hover / focus"
            durationToken="duration-normal"
            durationMs="200ms"
            easingToken="ease-out"
            easingCss="cubic-bezier(0, 0, 0.2, 1)"
            mode="micro"
            usage="hover states, focus rings, toggles, press feedback"
          />
          <MotionDemo
            label="Key moments B — modal / drawer"
            durationToken="duration-slow"
            durationMs="350ms"
            easingToken="ease-spring"
            easingCss="cubic-bezier(0.34, 1.56, 0.64, 1)"
            mode="key"
            usage="modal open, card add to deck, builder slide-over"
          />
          <MotionDemo
            label="Navigation — route transition"
            durationToken="duration-page"
            durationMs="300ms"
            easingToken="ease-in-out"
            easingCss="cubic-bezier(0.4, 0, 0.2, 1)"
            mode="nav"
            usage="page transitions, tab switches"
          />
        </div>
      </section>

      <Separator />

      <section className="mb-10">
        <SectionLabel>DURATIONS</SectionLabel>
        <div className="mt-4">
          <TokenRow
            token="duration-instant"
            value="50ms"
            usage="Micro — immediate click feedback, badge flash"
          />
          <TokenRow
            token="duration-fast"
            value="100ms"
            usage="Micro — tooltip appear, chip toggle"
          />
          <TokenRow
            token="duration-normal"
            value="200ms"
            usage="Micro — hover lift, focus ring, color transition"
          />
          <TokenRow
            token="duration-slow"
            value="350ms"
            usage="Key — modal/drawer/slide-over entry"
          />
          <TokenRow
            token="duration-page"
            value="300ms"
            usage="Navigation — route-level transitions"
          />
          <TokenRow
            token="duration-story"
            value="500ms"
            usage="Key — elaborate sequences (card reveal, builder expand)"
          />
        </div>
      </section>

      <section className="mb-10">
        <SectionLabel>EASINGS</SectionLabel>
        <div className="mt-4">
          <TokenRow
            token="ease-out"
            value="cubic-bezier(0, 0, 0.2, 1)"
            usage="Micro mode — starts fast, decelerates. Default for hover/focus."
          />
          <TokenRow
            token="ease-in"
            value="cubic-bezier(0.4, 0, 1, 1)"
            usage="Exit animations — accelerates out."
          />
          <TokenRow
            token="ease-in-out"
            value="cubic-bezier(0.4, 0, 0.2, 1)"
            usage="Navigation transitions — symmetric entry/exit."
          />
          <TokenRow
            token="ease-spring"
            value="cubic-bezier(0.34, 1.56, 0.64, 1)"
            usage="Key moments — overshoots slightly for a tactile, springy feel."
          />
        </div>
      </section>

      <Separator />

      <section>
        <SectionLabel>RULES</SectionLabel>
        <div className="mt-4 space-y-3">
          <p className="text-sm leading-relaxed text-text-muted">
            <strong className="font-semibold text-text">Micro (A):</strong> 50–200ms ·{' '}
            <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
              ease-out
            </code>
            . Every hover, focus, toggle, and press feedback. Never slower — users need instant
            confirmation.
          </p>
          <p className="text-sm leading-relaxed text-text-muted">
            <strong className="font-semibold text-text">Key moments (B):</strong> 300–500ms ·{' '}
            <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
              ease-spring
            </code>
            . Only for intentional transitions that communicate structure: modal open, deck builder
            slide-over, card added to deck. The slight overshoot is the tactile "craft" feeling.
          </p>
          <p className="text-sm leading-relaxed text-text-muted">
            <strong className="font-semibold text-text">Hover pattern:</strong> lift 2px (
            <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
              translateY(-2px)
            </code>
            ) +{' '}
            <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
              shadow-accent
            </code>{' '}
            glow. Press nudges down 1px. Both at{' '}
            <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
              duration-normal
            </code>{' '}
            ·{' '}
            <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
              ease-out
            </code>
            .
          </p>
          <p className="text-sm leading-relaxed text-text-muted">
            <strong className="font-semibold text-text">Reduced motion:</strong> all{' '}
            <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
              --duration-*
            </code>{' '}
            tokens collapse to{' '}
            <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">0ms</code>{' '}
            via{' '}
            <code className="rounded-sm bg-surface-raised px-1 py-0.5 font-mono text-xs">
              @media (prefers-reduced-motion)
            </code>
            . No extra code needed in components — read the token, it handles itself.
          </p>
        </div>
      </section>
    </div>
  );
}

export const Page: Story = {
  name: 'Motion',
  render: () => <MotionPage />,
};
