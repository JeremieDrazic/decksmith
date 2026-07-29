import * as Sentry from '@sentry/react';

/**
 * Initialise Sentry/GlitchTip in the browser. No-op unless:
 * - running in the browser (not during SSR),
 * - a production build (`import.meta.env.PROD`), and
 * - a DSN was baked in at build time (`VITE_SENTRY_DSN`).
 *
 * So local dev and server-side rendering never send events.
 */
export function initSentry(): void {
  const dsn = import.meta.env['VITE_SENTRY_DSN'];
  if (import.meta.env.SSR || !import.meta.env.PROD || !dsn) return;

  Sentry.init({
    dsn,
    // Must match the release the source maps are uploaded under at build time
    // (@sentry/vite-plugin, same VITE_APP_VERSION), so GlitchTip can un-minify stacks.
    release: import.meta.env['VITE_APP_VERSION'] || undefined,
    tracesSampleRate: 0.01, // 1% of transactions
  });
}
