import { Link } from '@tanstack/react-router';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { User } from '@decksmith/schema/user/user';
import {
  IconToggle,
  Logo,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@decksmith/web-ui';

import { AccountMenu } from './AccountMenu';

type TopBarProps = {
  /** Desktop (rail present) hides the brand here — the rail owns it. Mobile shows the small logo. */
  wide: boolean;
  /** Focus mode active (rail hidden). */
  focusActive: boolean;
  onToggleFocus: () => void;
  /** The signed-in user, forwarded to the account avatar. */
  user?: User;
};

/**
 * The bar over the content column: 68px tall and sticky in every state. On
 * desktop it carries the focus toggle and the account menu; on mobile, where
 * there is no rail, the brand returns on the left. The search slot joins when
 * `/cards` ships. No page title — the heading lives in the content.
 */
export function TopBar({ wide, focusActive, onToggleFocus, user }: TopBarProps) {
  const { t } = useTranslation('common');

  return (
    <header className="sticky top-0 z-sticky flex h-17 shrink-0 items-center gap-2 bg-bg px-4">
      {wide ? null : (
        <Link
          to="/dashboard"
          aria-label="Decksmith"
          className="rounded-interactive outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <Logo size="sm" />
        </Link>
      )}

      <div className="ml-auto flex items-center gap-1">
        {wide ? (
          <TooltipProvider delay={200}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <IconToggle
                    variant="ghost"
                    aria-label={t('nav.focusMode')}
                    pressed={focusActive}
                    onPressedChange={onToggleFocus}
                    icon={
                      focusActive ? (
                        <EyeOff strokeWidth={1.5} aria-hidden={true} />
                      ) : (
                        <Eye strokeWidth={1.5} aria-hidden={true} />
                      )
                    }
                  />
                }
              />
              <TooltipContent side="bottom">
                {focusActive ? t('nav.focusExit') : t('nav.focusEnter')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}

        <AccountMenu user={user} />
      </div>
    </header>
  );
}
