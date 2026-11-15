import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { NAV_ITEMS } from './nav-items';

/**
 * Mobile navigation: a floating pill inset from the edges, on the same `bg`
 * ground as the desktop rail — a hairline, no heavy shadow. Icon over label;
 * the active entry raises a `surface` tile, matching the rail. Stands above the
 * iOS home indicator.
 *
 * No high z-index: it sits at `z-sticky`, below the overlay/modal layers, so
 * menus and sheets opened from it still portal above it.
 */
export function BottomNav() {
  const { t } = useTranslation('common');

  return (
    <nav
      aria-label={t('nav.primary')}
      className="fixed inset-x-4 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-sticky flex items-stretch gap-1 rounded-modal border border-border-subtle bg-bg p-1.5"
    >
      {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => (
        <Link
          key={to}
          to={to}
          className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-interactive text-xs text-text-muted transition-colors duration-fast ease-out hover:text-text aria-[current=page]:bg-surface aria-[current=page]:text-text outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus"
        >
          <Icon className="size-5" aria-hidden={true} />
          {t(labelKey as never)}
        </Link>
      ))}
    </nav>
  );
}
