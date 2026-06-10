import { useEffect, useState } from 'react';

// ─── Shared ────────────────────────────────────────────────────────────────────

export function Separator() {
  return (
    <div className="flex items-center gap-3 my-10" aria-hidden>
      <div className="h-px flex-1 bg-border-subtle" />
      <span className="select-none font-mono text-sm text-brand">◈</span>
      <div className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-1 font-mono text-xs uppercase tracking-wide text-text-muted">{children}</p>
  );
}

// ─── Colors ────────────────────────────────────────────────────────────────────

function useTokenValue(token: string): string {
  const [value, setValue] = useState('');

  useEffect(() => {
    function read() {
      const style = getComputedStyle(document.documentElement);
      const v =
        style.getPropertyValue(`--${token}`).trim() ||
        style.getPropertyValue(`--color-${token}`).trim();
      setValue(v);
    }

    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [token]);

  return value;
}

export type SwatchProps = {
  /** CSS var name without the -- prefix: 'bg', 'surface', 'accent-text' */
  token: string;
  /** Tailwind bg class for color swatches: 'bg-surface' */
  bg?: string;
  /** Tailwind text class for text-on-surface swatches */
  text?: string;
  /** Short usage description */
  usage: string;
  /** Warning badge text — for decorative-only tokens */
  warn?: string;
};

export function Swatch({ token, bg, text, usage, warn }: SwatchProps) {
  const value = useTokenValue(token);

  return (
    <div className="flex flex-col gap-2">
      {text ? (
        <div className="flex h-16 items-center rounded-surface border border-border bg-surface px-4">
          <span className={`${text} font-display text-xl font-semibold tracking-tight`}>
            Decksmith
          </span>
        </div>
      ) : (
        <div className={`${bg} h-16 rounded-surface border border-border`} />
      )}
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-text">--{token}</span>
          {warn && (
            <span className="inline-block rounded-sm border border-warning/30 bg-warning-subtle px-1.5 py-0.5 font-mono text-xs leading-none text-warning-text">
              {warn}
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-text-faint">{value || '…'}</span>
        <span className="text-xs leading-snug text-text-muted">{usage}</span>
      </div>
    </div>
  );
}

export type SwatchGroupProps = {
  title: string;
  description?: string;
  cols?: 2 | 3 | 4 | 5;
  children: React.ReactNode;
};

const COLS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

export function SwatchGroup({ title, description, cols = 4, children }: SwatchGroupProps) {
  return (
    <section className="mb-10">
      <SectionLabel>{title}</SectionLabel>
      {description && (
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-text-muted">{description}</p>
      )}
      <div className={`grid ${COLS[cols] ?? 'grid-cols-4'} gap-4`}>{children}</div>
    </section>
  );
}

// ─── Typography ────────────────────────────────────────────────────────────────

export type TypeRowProps = {
  step: string;
  /** Display as px range, e.g. '15–17px (fluid)' */
  px: string;
  leading: string;
  sample?: string;
  mono?: boolean;
};

export function TypeRow({ step, px, leading, sample, mono }: TypeRowProps) {
  const fontClass = mono ? 'font-mono' : 'font-display tracking-tight';
  const defaultSample = mono ? '60 cards · 142 €' : 'Build decks deliberately';

  return (
    <div className="flex items-baseline gap-6 border-b border-border-subtle py-5 last:border-0">
      <span className="w-14 shrink-0 font-mono text-xs text-text-muted">{step}</span>
      <span
        className={`min-w-0 flex-1 overflow-hidden text-text ${fontClass}`}
        style={{
          fontSize: `var(--text-${step})`,
          lineHeight: `var(--leading-${step}, 1.5)`,
        }}
      >
        {sample ?? defaultSample}
      </span>
      <div className="w-36 shrink-0 space-y-0.5 text-right">
        <p className="font-mono text-xs text-text-faint">{px}</p>
        <p className="font-mono text-xs text-text-faint">lh {leading}</p>
      </div>
    </div>
  );
}

export type TrackingRowProps = {
  token: string;
  value: string;
  usage: string;
};

export function TrackingRow({ token, value, usage }: TrackingRowProps) {
  return (
    <div className="flex items-center gap-6 border-b border-border-subtle py-4 last:border-0">
      <span className="w-32 shrink-0 font-mono text-xs text-text-muted">--{token}</span>
      <span
        className="flex-1 font-display text-lg font-semibold text-text"
        style={{ letterSpacing: `var(--${token})` }}
      >
        DECKSMITH
      </span>
      <div className="w-36 shrink-0 space-y-0.5 text-right">
        <p className="font-mono text-xs text-text-faint">{value}</p>
        <p className="text-xs text-text-muted">{usage}</p>
      </div>
    </div>
  );
}

// ─── Spacing ───────────────────────────────────────────────────────────────────

export type SpacingRowProps = {
  /** Numeric label: '4', '8', '16' */
  size: string;
  px: string;
  /** Tailwind utilities: 'p-1 / gap-1' */
  tailwind: string;
};

export function SpacingRow({ size, px, tailwind }: SpacingRowProps) {
  const numPx = Number.parseInt(px, 10);

  return (
    <div className="flex items-center gap-6 border-b border-border-subtle py-2.5 last:border-0">
      <span className="w-12 shrink-0 text-right font-mono text-xs text-text-muted">{size}</span>
      <div
        className="shrink-0 rounded-sm border border-accent-border bg-accent-subtle"
        style={{ width: Math.max(numPx, 2), height: 20 }}
      />
      <div className="flex gap-6">
        <span className="font-mono text-xs text-text">{px}</span>
        <span className="font-mono text-xs text-text-faint">{tailwind}</span>
      </div>
    </div>
  );
}

// ─── Radius ────────────────────────────────────────────────────────────────────

export type RadiusBlockProps = {
  /** Token name without --: 'radius-interactive', 'radius-surface' */
  token: string;
  /** Human-readable label: '8px (0.5rem)' */
  value: string;
  /** Actual CSS value used for the visual demo — bypasses @theme var resolution */
  cssValue: string;
  usage: string;
  /** Semantic role — highlighted, preferred for components */
  semantic?: boolean;
};

export function RadiusBlock({ token, value, cssValue, usage, semantic }: RadiusBlockProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`h-20 border-2 ${
          semantic ? 'border-accent-border bg-accent-subtle' : 'border-border bg-surface-raised'
        }`}
        style={{ borderRadius: cssValue }}
      />
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xs text-text">--{token}</span>
        {semantic && (
          <span className="inline-block w-fit rounded-sm border border-accent-border bg-accent-subtle px-1.5 py-0.5 font-mono text-xs leading-none text-accent-text">
            use this
          </span>
        )}
        <span className="font-mono text-xs text-text-faint">{value}</span>
        <span className="text-xs leading-snug text-text-muted">{usage}</span>
      </div>
    </div>
  );
}

// ─── Shadows ───────────────────────────────────────────────────────────────────

export type ShadowCardProps = {
  token: string;
  /** Human-readable shorthand for display */
  value: string;
  /** Actual CSS box-shadow value — use var(--shadow-accent) for runtime vars, raw value for @theme statics */
  cssValue: string;
  usage: string;
};

export function ShadowCard({ token, value, cssValue, usage }: ShadowCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex h-28 items-center justify-center rounded-surface bg-surface"
        style={{ boxShadow: cssValue }}
      >
        <span className="font-mono text-xs text-text-muted">--{token}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xs text-text">--{token}</span>
        <span className="break-all font-mono text-xs leading-relaxed text-text-faint">{value}</span>
        <span className="text-xs text-text-muted">{usage}</span>
      </div>
    </div>
  );
}

// ─── Motion ────────────────────────────────────────────────────────────────────

export type MotionDemoProps = {
  label: string;
  /** Display token name: 'duration-normal' */
  durationToken: string;
  /** Actual CSS duration value: '200ms' */
  durationMs: string;
  /** Display token name: 'ease-spring' */
  easingToken: string;
  /** Actual CSS easing value: 'cubic-bezier(...)' */
  easingCss: string;
  /** Color group for the moving dot */
  mode: 'micro' | 'key' | 'nav';
  usage: string;
};

const MODE_COLOR: Record<string, string> = {
  micro: 'bg-accent',
  key: 'bg-success',
  nav: 'bg-info',
};

export function MotionDemo({
  label,
  durationToken,
  durationMs,
  easingToken,
  easingCss,
  mode,
  usage,
}: MotionDemoProps) {
  const [active, setActive] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <button
        aria-label={`Play ${label} animation`}
        className="relative flex h-24 w-full cursor-pointer items-center justify-center overflow-hidden rounded-surface border border-border bg-surface hover:border-accent-border"
        onClick={() => setActive((a) => !a)}
        type="button"
      >
        <div
          className={`h-8 w-8 ${MODE_COLOR[mode]} rounded-interactive`}
          style={{
            transform: active ? 'translateX(52px)' : 'translateX(-52px)',
            transition: `transform ${durationMs} ${easingCss}`,
          }}
        />
        <span className="absolute bottom-2 right-3 font-mono text-xs text-text-faint">
          click to toggle
        </span>
      </button>
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xs text-text">{label}</span>
        <span className="font-mono text-xs text-text-faint">
          --{durationToken} · --{easingToken}
        </span>
        <span className="text-xs text-text-muted">{usage}</span>
      </div>
    </div>
  );
}
