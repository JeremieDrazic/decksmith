import { type AnchorHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

export const textLinkVariants = cva('transition-colors duration-fast', {
  variants: {
    variant: {
      /** Inline link in body text — always accent-colored, underline on hover. */
      default: 'text-accent-text underline',
      /** Standalone link — muted by default, accent on hover. */
      subtle: 'text-text-muted hover:text-accent-text',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type TextLinkVariant = NonNullable<VariantProps<typeof textLinkVariants>['variant']>;

export type TextLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof textLinkVariants>;

/**
 * Styled anchor element for inline and standalone text links.
 * For internal navigation, use `AppLink` in `apps/web` (wraps TanStack Router's `Link`).
 *
 * @param variant - `default` (always accent) · `subtle` (muted → accent on hover)
 */
export function TextLink({ variant, className, ...props }: TextLinkProps) {
  // oxlint-disable-next-line jsx-a11y/anchor-has-content -- content comes from children via ...props
  return <a className={cn(textLinkVariants({ variant }), className)} {...props} />;
}
