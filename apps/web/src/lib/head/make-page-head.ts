const APP_NAME = 'Decksmith';

/**
 * Build a per-route document title in the form `"<page> · Decksmith"`.
 * Colocate the call in each route's `head()` — no separate translation file to maintain.
 * Titles are plain strings for now; i18n strategy is undecided (Phase 5 ADR).
 * All calls are greppable via `makePageHead(` for the future migration.
 */
export function makePageHead(title: string) {
  return { meta: [{ title: `${title} · ${APP_NAME}` }] };
}
