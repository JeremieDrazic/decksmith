import { LayoutGrid, type LucideIcon } from 'lucide-react';

export type NavItem = {
  /** Target route path (a literal TanStack Router route). */
  to: string;
  /** Icon shown in the rail and the bottom-nav. */
  icon: LucideIcon;
  /** i18n key (`common` namespace) used as the link's accessible name and tooltip. */
  labelKey: string;
};

/**
 * The shell's primary navigation, in display order — the single source rendered
 * by both the desktop rail and the mobile bottom-nav, so the two never diverge.
 *
 * Only live destinations appear here; Cards / Collection / Decks each join as a
 * one-line entry when their phase ships (no disabled "coming soon" items).
 *
 * `as const satisfies` keeps each `to` a literal so TanStack Router's `Link`
 * type-checks it, while enforcing the `NavItem` shape.
 */
export const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutGrid, labelKey: 'nav.dashboard' },
] as const satisfies readonly NavItem[];
