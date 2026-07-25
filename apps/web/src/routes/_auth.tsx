import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Logo, Mark, Text, TextLink } from '@decksmith/web-ui';

import { LanguageControl } from '../components/LanguageControl';
import { ThemeControl } from '../components/ThemeControl';
import { $getMe } from '../lib/auth/get-me';
import { parseInternalRedirect } from '../lib/redirect/parse-internal-redirect';

function AuthLayout() {
  useTranslation('common'); // subscribes to language changes so Trans re-renders on switch

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="fixed top-4 right-4 flex items-center gap-3">
        <ThemeControl />
        <LanguageControl />
      </div>
      <Link
        to="/"
        className="mb-8 flex flex-col items-center gap-3 rounded-interactive outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <Mark size="lg" animate="glow" />
        <Logo variant="wordmark" size="lg" />
      </Link>
      <div className="w-full max-w-sm md:bg-surface md:border md:border-border md:rounded-surface md:shadow-card md:p-8">
        <Outlet />
      </div>

      <footer className="mt-8 flex flex-col items-center gap-2">
        <Text as="p" size="xs" tone="faint" className="flex items-center gap-1">
          <Trans
            i18nKey="footer.madeBy"
            ns="common"
            components={{
              heart: (
                <Heart className="size-3 fill-current stroke-none text-accent" aria-hidden="true" />
              ),
              author: (
                <TextLink
                  href="https://github.com/JeremieDrazic"
                  variant="subtle"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </Text>
        <Text as="p" size="xs" tone="faint" className="flex items-center gap-3">
          <TextLink
            href="https://github.com/JeremieDrazic/decksmith"
            variant="subtle"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </TextLink>
          <TextLink
            href="https://jeremiedrazic.github.io/decksmith/"
            variant="subtle"
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs
          </TextLink>
          <TextLink href="#" variant="subtle">
            Storybook
          </TextLink>
        </Text>
      </footer>
    </div>
  );
}

export const Route = createFileRoute('/_auth')({
  // Reject open-redirect vectors (//evil.com, /\evil.com, https://…) — see parseInternalRedirect.
  validateSearch: (search: Record<string, unknown>) => ({
    redirectTo: parseInternalRedirect(search['redirectTo']),
  }),
  // Guest guard: an already-authenticated user has no reason to see the auth pages.
  // Send them to where they were headed (redirectTo) or the dashboard.
  beforeLoad: async ({ search }) => {
    const user = await $getMe();
    if (user) throw redirect({ to: search.redirectTo ?? '/dashboard' });
  },
  component: AuthLayout,
});
