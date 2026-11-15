import { useEffect, useReducer } from 'react';

import { Outlet } from '@tanstack/react-router';

import type { User } from '@decksmith/schema/user/user';
import { BREAKPOINTS, useIsHydrated, useMediaQuery } from '@decksmith/web-ui';

import { BottomNav } from './BottomNav';
import { Rail } from './Rail';
import { writeFoldedCookie, writeWideCookie } from './shell-cookie';
import { shellNavigationReducer } from './shell-navigation-reducer';
import { CONTENT_ID, SkipToContent } from './SkipToContent';
import { TopBar } from './TopBar';

type AppShellProps = {
  /**
   * Viewport shape the server rendered, seeded from the `wide` cookie by the
   * `_authenticated` loader. Used until hydration, then `useMediaQuery` corrects
   * it — so a returning visitor's first paint is already right, no flash.
   */
  initialWide: boolean;
  /** Whether the rail was left collapsed, seeded from the `folded` cookie. */
  initialFolded: boolean;
  /** The signed-in user, forwarded to the account avatar. Absent in the isolated preview. */
  user?: User;
};

/**
 * The frame every authenticated screen sits in: a full-height rail down the left
 * at `md` and up, a floating bottom-nav below — only ever one, chosen in JS so a
 * screen reader never meets two "Primary navigation" landmarks.
 *
 * One continuous background, no framed "sheet": the rail and the content share
 * the app ground, separated only by hairlines. The rail and top bar are sticky
 * while the document itself scrolls, so expanding the rail never shifts the page.
 *
 * Focus mode hides the rail entirely (kept out of the DOM) while preserving the
 * collapsed/expanded choice — it is an in-memory state, not persisted.
 */
export function AppShell({ initialWide, initialFolded, user }: AppShellProps) {
  const measured = useMediaQuery(BREAKPOINTS.md);
  const isHydrated = useIsHydrated();
  const wide = isHydrated ? measured : initialWide;

  // Remember the measured shape for the next request, so a reload paints the right
  // navigation on the server. Every render: a window resized past the breakpoint says so.
  useEffect(() => {
    if (isHydrated) writeWideCookie(measured);
  }, [isHydrated, measured]);

  const [nav, dispatch] = useReducer(shellNavigationReducer, {
    folded: initialFolded,
    hidden: false,
  });

  // Persist only the fold — focus (hidden) is deliberately session-local.
  useEffect(() => {
    if (isHydrated) writeFoldedCookie(nav.folded);
  }, [isHydrated, nav.folded]);

  return (
    <div className="flex min-h-dvh bg-bg">
      <SkipToContent />

      {wide && !nav.hidden ? (
        <Rail folded={nav.folded} onToggleFold={() => dispatch('toggleFold')} />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          wide={wide}
          focusActive={nav.hidden}
          onToggleFocus={() => dispatch('toggleFocus')}
          user={user}
        />
        <div
          id={CONTENT_ID}
          tabIndex={-1}
          className={wide ? 'px-2 pt-2 pb-8 outline-none' : 'px-5 pt-5 pb-28 outline-none'}
        >
          <Outlet />
        </div>
      </div>

      {wide ? null : <BottomNav />}
    </div>
  );
}
