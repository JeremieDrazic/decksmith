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
    tracesSampleRate: 0.01, // 1% of transactions
  });
}
