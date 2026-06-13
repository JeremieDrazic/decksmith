import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

const eyebrowVariants = cva('font-mono text-xs leading-xs tracking-wide uppercase font-semibold', {
  variants: {
    tone: {
      default: 'text-text',
      muted: 'text-text-muted',
      accent: 'text-accent-text',
    },
  },
  defaultVariants: {
    tone: 'muted',
  },
});

type EyebrowTag = 'span' | 'p' | 'dt';

export type EyebrowProps = VariantProps<typeof eyebrowVariants> &
  Omit<React.HTMLAttributes<HTMLElement>, 'color'> & {
    /** HTML tag to render. Defaults to span. */
    as?: EyebrowTag;
  };

/**
 * Uppercase overline text — section eyebrows, card metadata, category tags.
 * Always JetBrains Mono, xs scale, wide tracking. Not for body copy.
 * For form field labels use the semantic <Label> component instead.
 *
 * @example
 * <Eyebrow>Mana curve</Eyebrow>
 * <Eyebrow tone="accent">Commander</Eyebrow>
 * <Eyebrow as="p">LEGENDARY CREATURE</Eyebrow>
 */
export function Eyebrow({ as: Tag = 'span', tone, className, ...props }: EyebrowProps) {
  return <Tag className={cn(eyebrowVariants({ tone }), className)} {...props} />;
}
