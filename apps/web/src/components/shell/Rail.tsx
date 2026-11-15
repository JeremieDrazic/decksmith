import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Logo, Mark, TooltipProvider } from '@decksmith/web-ui';

import { NAV_ITEMS } from './nav-items';
import { RailEntry } from './RailEntry';
import { RailFold } from './RailFold';

type RailProps = {
  folded: boolean;
  onToggleFold: () => void;
};

/**
 * Desktop navigation: a full-height rail down the left edge, on the same ground
 * (`bg`) as the content — no panel, no border, just the continuous background.
 * Sticky while the document scrolls, so expanding it never shifts the page.
 *
 * The brand sits in a fixed 68px box that lines up with the top bar, so folding
 * (wordmark → mark) never moves the entries below. Folded, the rail narrows to
 * its icons and labels move into tooltips — one `TooltipProvider` so the second
 * chip is instant.
 */
export function Rail({ folded, onToggleFold }: RailProps) {
  const { t } = useTranslation('common');

  return (
    <TooltipProvider delay={200}>
      <aside
        className={`sticky top-0 flex h-dvh shrink-0 flex-col bg-bg px-3 transition-[width] duration-normal ease-out ${
          folded ? 'w-17' : 'w-51'
        }`}
      >
        {/* Brand centred in both shapes; fixed 68px box aligned with the top bar. */}
        <div className="flex h-17 shrink-0 items-center justify-center">
          <Link
            to="/dashboard"
            aria-label="Decksmith"
            className="rounded-interactive outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            {folded ? <Mark /> : <Logo size="sm" />}
          </Link>
        </div>

        {/* Rail padding (px-3.5/px-2.5) + entry padding keep the icon at the same x in
            both shapes, so folding never shifts the entries. */}
        <nav aria-label={t('nav.primary')} className="flex-1 py-3">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <RailEntry item={item} collapsed={folded} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 py-3">
          <RailFold collapsed={folded} onToggle={onToggleFold} />
        </div>
      </aside>
    </TooltipProvider>
  );
}
