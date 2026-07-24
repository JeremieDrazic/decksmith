import { createFileRoute, redirect } from '@tanstack/react-router';

import { $getMe } from '../lib/auth/get-me';

/**
 * The root path has no landing page (yet): it redirects based on auth state —
 * `/dashboard` when signed in, `/login` otherwise. Runs in `beforeLoad` so the
 * decision happens server-side (via the cookie-reading `$getMe`), before render.
 *
 * Deep links to protected routes are handled separately by the `_authenticated`
 * guard, which preserves the origin path via `redirectTo`.
 */
export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const user = await $getMe();
    throw redirect({ to: user ? '/dashboard' : '/login' });
  },
});
