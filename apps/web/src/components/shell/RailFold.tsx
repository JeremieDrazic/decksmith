import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Tooltip, TooltipContent, TooltipTrigger } from '@decksmith/web-ui';

type RailFoldProps = {
  collapsed: boolean;
  onToggle: () => void;
};

// Same row shape and padding as a nav entry, so the icon lines up with them and
// never shifts between states. No active styling — this is an action, not a place.
const FOLD_BASE =
  'flex min-h-11 w-full items-center gap-3 rounded-interactive px-3.5 text-sm text-text-muted transition-colors duration-fast ease-out hover:bg-surface hover:text-text outline-none focus-visible:ring-2 focus-visible:ring-border-focus';

/**
 * Collapses the rail to its icons, or expands it back. Carries its label like a
 * nav entry when expanded; collapsed, the label moves to a tooltip. The icon and
 * accessible name both flip with the state, so the change is never purely visual.
 */
export function RailFold({ collapsed, onToggle }: RailFoldProps) {
  const { t } = useTranslation('common');
  // Short visible label when expanded; descriptive name for the folded tooltip/aria.
  const expandLabel = t('nav.expandRail');

  const button = (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? expandLabel : undefined}
      className={FOLD_BASE}
    >
      {collapsed ? (
        <PanelLeftOpen className="size-4 shrink-0" aria-hidden={true} />
      ) : (
        <PanelLeftClose className="size-4 shrink-0" aria-hidden={true} />
      )}
      {collapsed ? null : <span className="truncate">{t('nav.collapse')}</span>}
    </button>
  );

  if (!collapsed) return button;

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side="right">{expandLabel}</TooltipContent>
    </Tooltip>
  );
}
