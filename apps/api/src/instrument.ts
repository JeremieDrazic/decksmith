import * as Sentry from '@sentry/node';

/**
 * Sentry/GlitchTip initialisation. Imported FIRST in index.ts (before any other
 * module) so the SDK's auto-instrumentation wraps everything.
 *
 * Reads process.env directly rather than the validated `config` so it can run
 * before that module loads. Enabled only in production and only when a DSN is
 * set — in dev it's a no-op, so local errors never reach GlitchTip.
 */
const dsn = process.env['SENTRY_DSN'];

if (process.env['NODE_ENV'] === 'production' && dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.01, // 1% of transactions
    // GlitchTip doesn't support Sentry release-health sessions.
    // (session tracking is off by default in @sentry/node v8+)
  });
}
