import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

const headingVariants = cva('font-display tracking-tight', {
  variants: {
    size: {
      xl: 'text-xl leading-xl',
      '2xl': 'text-2xl leading-2xl',
      '3xl': 'text-3xl leading-3xl',
      '4xl': 'text-4xl leading-4xl',
    },
    weight: {
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    },
    tone: {
      default: 'text-text',
      muted: 'text-text-muted',
      accent: 'text-accent-text',
    },
  },
  defaultVariants: {
    size: '3xl',
    weight: 'bold',
    tone: 'default',
  },
});

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type HeadingProps = VariantProps<typeof headingVariants> &
  Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'> & {
    /** The HTML heading tag to render. Defaults to h2. */
    as?: HeadingTag;
  };

/**
 * Semantic heading component. Decouples visual size from HTML tag so hierarchy
 * and appearance can be controlled independently.
 *
 * @example
 * <Heading as="h1" size="5xl">Decksmith</Heading>
 * <Heading as="h2" size="xl" weight="semibold">Section title</Heading>
 */
export function Heading({ as: Tag = 'h2', size, weight, tone, className, ...props }: HeadingProps) {
  return <Tag className={cn(headingVariants({ size, weight, tone }), className)} {...props} />;
}
