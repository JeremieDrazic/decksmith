import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Tooltip, TooltipContent, TooltipTrigger } from '@decksmith/web-ui';

import type { NavItem } from './nav-items';

type RailEntryProps = {
  item: NavItem;
  /** Collapsed to its icon, with the label shown in a tooltip to the right. */
  collapsed: boolean;
};

// Colour + hover + active, shared by both states. `group` so the ◈ marker can
// read the link's active state. The current entry is marked by the router's
// `aria-current="page"` — one source for the announcement and the styling.
// Active = a `surface` tile raised off the rail's `bg` ground + weight; the
// accent shows only in the ◈ marker, so the row stays calm.
const ENTRY_BASE =
  'group flex min-h-11 items-center gap-3 rounded-interactive text-sm text-text-muted transition-colors duration-fast ease-out hover:bg-surface hover:text-text aria-[current=page]:bg-surface aria-[current=page]:font-medium aria-[current=page]:text-text aria-[current=page]:shadow-inset outline-none focus-visible:ring-2 focus-visible:ring-border-focus';

/**
 * One place in the rail: an icon and its label as a link. Expanded, the active
 * entry carries a small ◈ diamond — the brand mark as the "you are here" rune.
 * Collapsed, the label drops to an `aria-label` and a tooltip.
 */
export function RailEntry({ item: { to, icon: Icon, labelKey }, collapsed }: RailEntryProps) {
  const { t } = useTranslation('common');
  // `labelKey` is a dynamic string; the typed `t` only accepts known literal keys,
  // so the key is cast through `never` to satisfy the signature.
  const label = t(labelKey as never);

  const link = (
    <Link to={to} aria-label={collapsed ? label : undefined} className={`${ENTRY_BASE} px-3.5`}>
      <Icon className="size-4 shrink-0" aria-hidden={true} />
      {collapsed ? null : (
        <>
          <span className="truncate">{label}</span>
          {/* ◈ — revealed only on the active entry, reserved space otherwise so the label never shifts. */}
          <span
            aria-hidden={true}
            className="ml-auto size-1 rotate-45 bg-accent-text opacity-0 transition-opacity duration-fast group-aria-[current=page]:opacity-100"
          />
        </>
      )}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
