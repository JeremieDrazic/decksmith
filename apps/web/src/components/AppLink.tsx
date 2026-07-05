import { type ComponentProps } from 'react';
import { Link } from '@tanstack/react-router';
import { textLinkVariants, type TextLinkVariant } from '@decksmith/web-ui';

export type AppLinkProps = ComponentProps<typeof Link> & {
  variant?: TextLinkVariant;
};

/**
 * Router-aware text link. Wraps TanStack Router's `Link` with the same visual
 * styles as `TextLink` from `packages/web-ui`.
 *
 * Use `TextLink` for external `href` links; use `AppLink` for internal navigation.
 *
 * @param variant - `default` (always accent) · `subtle` (muted → accent on hover)
 */
export function AppLink({ variant, className, ...props }: AppLinkProps) {
  const base = textLinkVariants({ variant });
  return <Link className={className ? `${base} ${className}` : base} {...props} />;
}
