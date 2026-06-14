import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

const textVariants = cva('', {
  variants: {
    size: {
      sm: 'text-sm leading-sm',
      base: 'text-base leading-base',
      lg: 'text-lg leading-lg',
    },
    tone: {
      default: 'text-text',
      muted: 'text-text-muted',
      faint: 'text-text-faint',
      accent: 'text-accent-text',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
    mono: {
      true: 'font-mono',
      false: 'font-body',
    },
  },
  defaultVariants: {
    size: 'base',
    tone: 'default',
    weight: 'normal',
    mono: false,
  },
});

type TextTag = 'span' | 'p' | 'div' | 'li' | 'blockquote';

export type TextProps = VariantProps<typeof textVariants> &
  Omit<React.HTMLAttributes<HTMLElement>, 'color'> & {
    /** HTML tag to render. Defaults to span — opt into p for block paragraphs. */
    as?: TextTag;
  };

/**
 * Body copy at the encapsulated type scale. Use `mono` for numbers, prices,
 * and stats (switches to JetBrains Mono). Defaults to inline span — pass
 * `as="p"` for block paragraph semantics.
 *
 * @example
 * <Text>Build decks deliberately.</Text>
 * <Text size="sm" tone="muted">Secondary copy</Text>
 * <Text mono>60 cards · 142 €</Text>
 */
export function Text({
  as: Tag = 'span',
  size,
  tone,
  weight,
  mono,
  className,
  ...props
}: TextProps) {
  return <Tag className={cn(textVariants({ size, tone, weight, mono }), className)} {...props} />;
}
