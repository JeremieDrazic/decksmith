import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';
import { Mark } from '../Mark';
import type { MarkProps } from '../Mark';

const logoVariants = cva('inline-flex items-center', {
  variants: {
    size: {
      sm: 'gap-1.5',
      md: 'gap-2',
      lg: 'gap-3',
    },
  },
  defaultVariants: { size: 'md' },
});

const WORD_CLASS = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' } as const;

export type LogoProps = React.ComponentProps<'span'> &
  VariantProps<typeof logoVariants> & {
    /**
     * Which part(s) to render.
     * - `lockup`   — mark + wordmark side by side (default)
     * - `wordmark` — "Decksmith" text only
     *
     * For the mark alone, use <Mark> directly.
     */
    variant?: 'lockup' | 'wordmark';
    /** Forwarded to the inner <Mark>. */
    animate?: MarkProps['animate'];
  };

/**
 * Decksmith brand lockup — mark + wordmark, or wordmark only.
 *
 * For the diamond mark alone (collapsed sidebar, favicon), use <Mark> instead.
 *
 * Color rules:
 * - Mark renders in var(--accent) — amber dark / violet light.
 * - "Deck" in text-text, "smith" in text-accent-text (WCAG AA in both modes).
 *
 * Renders a <span> — wrap in <a> or router Link at the call site.
 *
 * @example
 * <a href="/"><Logo /></a>
 *
 * @example
 * // Hero lockup with glow
 * <Logo size="lg" animate="glow" />
 */
export function Logo({
  variant = 'lockup',
  size = 'md',
  animate = 'none',
  className,
  ...props
}: LogoProps) {
  const resolvedSize = (size ?? 'md') as 'sm' | 'md' | 'lg';
  const wordCls = WORD_CLASS[resolvedSize];

  return (
    <span className={cn(logoVariants({ size }), className)} {...props}>
      {variant === 'lockup' ? <Mark size={resolvedSize} animate={animate} /> : null}
      <span className={cn('font-display font-bold leading-none tracking-tight', wordCls)}>
        <span className="text-text">Deck</span>
        <span className="text-accent-text">smith</span>
      </span>
    </span>
  );
}
