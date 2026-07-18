# Decisions Log

Micro-decisions that don't warrant a full ADR. Ordered newest-first.

---

## [2026-07-18] — TypeScript 7.0.2 + oxlint-tsgolint 0.25.0

**Context:** Session 21 dep sweep. TypeScript 6→7 was a major bump — upgraded without code changes
because the codebase was already strict and well-typed. Prisma client regeneration (`db:generate`)
was required after `pnpm install` to restore generated types (expected behaviour — Prisma always
needs a generate step after install). All 210 tests pass, 0 typecheck errors. **Impact:**
`pnpm-workspace.yaml` (catalog), `package.json` (root devDeps).

---

## [2026-07-15] — vi.hoisted() for mock class before vi.mock()

**Context:** Session 20 — `prisma-errors.test.ts` needed a `PrismaClientKnownRequestError` mock
class to test `instanceof` checks. Defining the class as a regular `const` above `vi.mock()` caused
`ReferenceError: Cannot access '...' before initialization` because Vitest hoists `vi.mock()` to the
top of the file before any other code executes. **Decision:** Use
`vi.hoisted(() => { class Foo {} return { Foo }; })` — the callback runs before module evaluation,
so the returned value is available when the `vi.mock()` factory executes. Applied in
`prisma-errors.test.ts`. The shared `__mocks__/db.ts` doesn't have this issue (no hoisting needed in
a plain module). **Impact:** `packages/services/src/prisma-errors.test.ts`,
`packages/services/src/__mocks__/db.ts`.

---

## [2026-07-15] — PrismaClientKnownRequestError mock must match real constructor signature

**Context:** Session 20 — `isUniqueConstraintError` uses
`instanceof Prisma.PrismaClientKnownRequestError`. The `__mocks__/db.ts` initially defined the mock
class as `constructor(code: string, _options?)`, but TypeScript type-checks constructor calls
against the _original_ module type even when `vi.mock` is active. The real Prisma class requires
`(message: string, { code, clientVersion })`. **Decision:** Mock class constructor matches the real
signature — first arg is `message`, second is `{ code, clientVersion }`, with
`this.code = options.code`. Call sites use
`new Prisma.PrismaClientKnownRequestError('...', { code: 'P2002', clientVersion: '5.0.0' })`.
**Impact:** `packages/services/src/__mocks__/db.ts`,
`packages/services/src/user/user-service.test.ts`.

---

## [2026-07-15] — getFieldError t param typed via ErrorKey, not string

**Context:** Session 19 — adding an optional `t` param to `getFieldError` to translate Zod error
codes. Typing `t` as `(key: string) => string` caused a TypeScript contravariance error:
react-i18next's typed `t` (post-`CustomTypeOptions` augmentation) only accepts specific union keys,
not `string`. **Decision:** Type the param as `t?: (key: ErrorKey) => string` where
`ErrorKey = keyof I18nResources['errors']`, imported from `@decksmith/i18n`. The `as ErrorKey` cast
stays inside `getFieldError`, call sites pass `tError` directly with no cast. **Impact:**
`apps/web/src/lib/form/get-field-error.ts` imports from `@decksmith/i18n`.

---

## [2026-07-15] — i18n namespace strategy: feature-based, all strings in packages/i18n

**Context:** Session 19 — deciding where translations live and how to organize them. **Decision:**
All strings (web + future mobile) in `packages/i18n`, organized by feature namespace (`auth`,
`common`, `errors`) — not by platform. No app-level locale files. **Impact:**
`apps/web/src/locales/` deleted. `packages/i18n` is the single source of truth.

---

## [2026-07-14] — pnpm 11 migration: allowBuilds + CI=true in hook

**Context:** Session 18 — user upgraded pnpm to v11.13.0 (via volta). Two breaking changes surfaced:
(1) `pnpm.onlyBuiltDependencies` in `package.json` is no longer read — pnpm 11 deprecated it in
favour of `allowBuilds` in `pnpm-workspace.yaml`; (2) pnpm 11 now requires TTY confirmation before
purging the modules directory, which breaks in husky hooks (no TTY context).

**Decisions:**

- **`allowBuilds` replaces `onlyBuiltDependencies`** — moved to `pnpm-workspace.yaml` as a
  `allowBuilds: { pkg: true }` map. Approved packages: `@prisma/engines`, `@swc/core`, `esbuild`,
  `msw`, `prisma`, `unrs-resolver`. `@parcel/watcher` and `@prisma/client` dropped (no longer need
  build scripts in pnpm 11).
- **`export CI=true` in `.husky/pre-commit`** — pnpm 11 source:
  `confirmModulesPurge: opts.confirmModulesPurge && !opts.ci`. Setting `CI=true` maps to
  `opts.ci = true` (via `ci-info`), which short-circuits the TTY check. Adding `ci=true` to `.npmrc`
  would affect all `pnpm` commands globally; hook-scoped env var is the right boundary.
- **`confirmModulesPurge` is not a user-facing config key** — the pnpm error hint ("set
  confirmModulesPurge to false") is misleading: the value is derived internally from
  `!(autoConfirmAllPrompts || force)`, not settable in `.npmrc`.

**Impact:** `pnpm-workspace.yaml`, `.husky/pre-commit`, root `package.json` (`engines.pnpm` bumped
to `>=11.0.0`).

---

## [2026-07-14] — Service layer: ServiceError + exception mapper (see ADR-0024)

**Context:** Session 18 — routes had repeated try/catch blocks that mapped Prisma/Supabase errors to
`HttpError`. Each route handler had the same boilerplate. As the route count grows, this becomes a
maintenance problem.

**Decisions:**

- **`ServiceError(code, message)` thrown by services, never `HttpError`** — services are
  framework-agnostic; they don't know about HTTP. Throwing `HttpError` from a service would couple
  business logic to the transport layer.
- **`SERVICE_ERROR_STATUS` lookup table in `error-handler.ts`** — the Fastify global error handler
  maps `ServiceError.code → HTTP status`. One place to maintain, zero try/catch in routes. Unknown
  codes map to 500.
- **Routes only try/catch when a side effect must run before re-throwing** — the only case is
  `/refresh`: cookies must be cleared even on failure. Pattern:
  `try { ... } catch (error) { clearCookies; throw error; }`.
- **No DI, no repository pattern** — services call `prisma` singleton directly. Module-level mock
  via `vi.mock('@decksmith/db')` handles tests. A repository layer would add indirection without
  payoff at current scale.

**Impact:** `packages/services/` (new package), `apps/api/src/plugins/error-handler.ts`,
`apps/api/src/modules/auth/auth-routes.ts`, `apps/api/src/modules/user/user-routes.ts`.

---

## [2026-07-14] — Cookie-based theme persistence (mirror of language pattern)

**Context:** Session 17 — `ThemeProvider` read `localStorage` in a `useState` initializer, causing
an SSR hydration mismatch: the server rendered `null` (no `localStorage`), the client rendered
`'dark'`, React logged a mismatch on `ThemeControl` (label text + Switch state). Several approaches
were considered and rejected: `suppressHydrationWarning` patches (doesn't fix the root cause),
`useEffect` (defers reconciliation, still a mismatch on first paint).

**Decisions:**

- **Cookie over localStorage for theme preference** — exactly mirrors the language cookie pattern
  established in session 16. The root loader calls `getCookie(THEME_COOKIE)` server-side and passes
  `initialTheme` to `ThemeProvider`. Server and client render the same `.dark` class → zero
  mismatch.
- **`VALID_THEMES` for raw `getCookie` validation** — `getCookie` returns the raw cookie value
  (`'light'`), not the full cookie string (`'decksmith-theme=light'`). `parseThemeFromCookieString`
  expects the full string (regex requires `key=value`). To avoid misuse, `$getServerTheme` validates
  the raw value directly against `VALID_THEMES` without calling `parseThemeFromCookieString`.
- **Default theme = `'dark'` (brand dark-first), `prefers-color-scheme` OS ignored pre-login** —
  mirrors the language default (`'en'`, ignoring `Accept-Language`). OS preference will be honored
  post-login via `UserPreferences.theme` (server knows the value). Client hints considered and
  rejected (requires server config outside Vite, complicates the mental model).
- **Anti-FOUC inline script eliminated** — since theme is derivable server-side, `.dark` is in the
  initial HTML. `dangerouslySetInnerHTML` + `oxlint-disable react/no-danger` + 3
  `suppressHydrationWarning` attributes all removed.
- **No `js-cookie` dependency at 2 call sites** — 2
  `oxlint-disable-next-line unicorn/no-document-cookie` comments are honest tools. Adding
  `js-cookie` is worth it when a 3rd preference (`UserPreferences.theme`) joins from the API — at
  that point a `resolvePreference` abstraction in `apps/web/src/lib/` makes sense.
- **Testing rule codified in `CLAUDE.md`** — every exported pure function gets a colocated
  `.test.ts` in the same session. Minimum: happy path + 2 edge cases. The `getCookie` vs
  cookie-string bug would have been caught immediately by this rule.

**Impact:** `packages/web-ui/src/hooks/use-theme/` (new `theme-cookie.ts` + `theme-cookie.test.ts`,
rewritten `ThemeProvider.tsx`), `apps/web/src/routes/__root.tsx`, `apps/web/src/components/`,
`CLAUDE.md`.

---

## [2026-07-14] — Auth guard: `beforeLoad` + SSR Cookie forwarding (see ADR-0023)

**Context:** Session 17 — dashboard needed protection; unauthenticated users accessing `/dashboard`
directly via URL (SSR) must be redirected before any content renders.

**Decisions:**

- **`beforeLoad` for SSR-safe guard** — TanStack Router `beforeLoad` runs during SSR and SPA
  navigation before the component mounts. A client-side `useEffect` redirect would flash protected
  content. `beforeLoad` never renders the route if the check fails.
- **`$getMe` server function forwards Cookie header** — during SSR, the browser's session cookie is
  on the incoming request, not in `document.cookie`. `getRequest()` from
  `@tanstack/react-start/server` reads the raw request headers; we forward `Cookie` explicitly to
  `apps/api` so Supabase Auth can verify the session server-to-server.
- **`redirectTo` search param on `/login`** — login page reads `redirectTo` via `validateSearch` +
  `useSearch({ from: '/_auth/login' })` and navigates there on success. If absent, defaults to
  `/dashboard`. Standard pattern — preserves user intent across auth redirects.

**Impact:** `apps/api/src/modules/auth/auth-routes.ts` (`GET /me`), `packages/api-client`
(`auth.me()`, fetcher `headers?`), `apps/web/src/lib/auth/get-me.ts`,
`apps/web/src/routes/_authenticated.tsx`, `apps/web/src/routes/_authenticated/dashboard/`,
`apps/web/src/routes/_auth/login.tsx`, `apps/docs/adr/0023-auth-guard-ssr-beforeload.md`.

---

## [2026-07-05] — Cookie-based i18n persistence + TextLink/AppLink split

**Context:** Session 16 — eliminating FOUT on translated strings (SSR/client divergence when
language was in localStorage) + introducing typed navigation links without coupling the DS to
TanStack Router.

**Decisions:**

- **Cookie over localStorage for language preference** — cookies are sent with every HTTP request,
  so the TanStack Start root loader can call `getCookie(LANGUAGE_COOKIE)` via
  `@tanstack/react-start/server` server-side and pass the resolved language to
  `i18n.changeLanguage()` before the component tree renders. localStorage is client-only — the
  server has no access, causing SSR to always render in `'en'` and the client to correct it
  post-hydration (FOUT). `LANGUAGE_COOKIE`, `SUPPORTED_LANGUAGES`, and `parseLangFromCookieString`
  exported from `i18n.ts` as the single source of truth.
- **`createServerFn` for SSR cookie reading, guarded by `typeof window === 'undefined'`** — the
  handler runs directly in the SSR pipeline (no HTTP round-trip); on the client the guard
  short-circuits to `parseLangFromCookieString(document.cookie)`.
- **`TextLink` (DS) / `AppLink` (apps/web) split** — `packages/web-ui` stays router-agnostic:
  `TextLink` wraps a plain `<a>` and exports `textLinkVariants` (cva). `AppLink` in `apps/web` owns
  the TanStack Router `Link` integration and applies `textLinkVariants` for visual consistency. No
  DS component takes a router dependency.

**Impact:** `apps/web/src/i18n.ts`, `apps/web/src/routes/__root.tsx`,
`apps/web/src/components/LanguageControl.tsx`, `packages/web-ui/src/ui/TextLink/`,
`apps/web/src/components/AppLink.tsx`.

---

## [2026-07-05] — bg-border-subtle for Skeleton background

**Context:** Session 16 — Skeleton component visual verification.

**Decision:** `bg-border-subtle` chosen over `bg-surface-raised` as the Skeleton fill — visually
readable against both `bg-surface` (dark and light mode) without being too prominent.
`bg-surface-raised` was too subtle on `bg-surface` in dark mode.

**Impact:** `packages/web-ui/src/ui/Skeleton/Skeleton.tsx`.

---

## [2026-07-05] — ThemeProvider anti-FOUC inline script — JSON.parse for useLocalStorage

**Context:** Session 16 — `ThemeProvider` reads localStorage. `useLocalStorage` JSON-stringifies
values, so localStorage stores `'"dark"'` not `'dark'`.

**Decision:** Anti-FOUC inline script in `__root.tsx` wraps the localStorage read in `JSON.parse()`
before comparing to `'dark'`/`'light'`, with a `try/catch` guard for when localStorage is blocked.
Without this the script silently fails and the first paint flashes the wrong theme.

**Impact:** `apps/web/src/routes/__root.tsx` (`ANTI_FOUC_SCRIPT` constant).

---

## [2026-07-04] — tinykeys added to packages/web-ui (useKeyboardShortcut)

**Context:** Session 16 — fondations hooks frontend (Skeleton, useMediaQuery, useKeyboardShortcut).

**Decisions:**

- **`tinykeys@^4.0.0` added to `packages/web-ui`** — wraps native
  `addEventListener`/`removeEventListener` with a clean shortcut syntax (`Control+k`, `$mod+k`,
  sequences). Chosen over `react-hotkeys-hook` (React-agnostic, < 1kB, we control the React API
  surface via our own wrapper hook) and over a hand-rolled implementation (tinykeys handles modifier
  normalization, `$mod` cross-platform, `contenteditable`/input ignoring out of the box).
- **Named export `{ tinykeys }` not default** — inline
  `// oxlint-disable-next-line unicorn/prefer-global-this` on `tinykeys(window, …)` call — tinykeys
  types require `Window` explicitly, `globalThis` cast would be noisier.

**Impact:** `packages/web-ui/package.json` (+1 dep), `pnpm-lock.yaml`,
`packages/web-ui/src/hooks/use-keyboard-shortcut/`.

---

## [2026-07-03] — @tanstack/react-form added to apps/web (Phase 4.4 Auth UI)

**Context:** Session 15 — Login, Register, Forgot Password pages.

**Decisions:**

- **`@tanstack/react-form@^1.33.0` added directly to `apps/web`** — ADR-0018 (§ Forms) mandates
  TanStack Form. Added as a direct dep of `apps/web` (not the pnpm catalog) because no other package
  consumes forms today; will be promoted to catalog if `apps/mobile` or a shared package adopts it.
- **Zod Standard Schema integration used (no adapter)** — TanStack Form v1 ships native support for
  Zod v4 Standard Schema via `validators={{ onChange: ZodSchema }}`. No `@tanstack/zod-form-adapter`
  needed. Raw Zod issue objects (`{origin, code, format, pattern, path, message}`) are returned in
  `field.state.meta.errors` — `getFieldError()` extracts `.message` before rendering.
- **`getFieldError` and `makeSubmitHandler` placed in `apps/web/src/lib/form/`** — app-level
  utilities, not shared across packages. No colocated tests (apps/web has no Vitest config).

**Impact:** `apps/web/package.json` (+1 dep), `apps/web/src/lib/form/`, 3 auth route files.

---

## [2026-06-25] — lucide-react adopted as the icon library for packages/web-ui

**Context:** Session 11 — floating components, NavigationButton, Lucide migration.

**Decisions:**

- **`lucide-react@^1.21.0` added to `packages/web-ui`** — ADR-0018 (§ Icons) mandates Lucide as the
  sole icon system. Added as a direct dependency of `packages/web-ui` (not the pnpm catalog) because
  `apps/web` does not yet consume it directly; it will be promoted to catalog when a second consumer
  appears.
- **MTG icons remain hand-crafted SVG** — Keyrune/MTG glyphs (`packages/web-ui/src/mtg/`) are
  canonical MTG iconography and not available in any generic icon library. They stay as custom SVG
  components and are explicitly excluded from the Lucide migration scope.
- **Inline SVG in `*.stories.tsx` files replaced with Lucide** — ~29 duplicated inline SVG elements
  across 10 story files replaced story-by-story. This is cosmetic for stories but enforces the
  one-system rule immediately so the pattern doesn't spread to component files.
- **Internal icons in components also replaced** — `SelectIcon` (chevron) and `SelectItem`
  `ItemIndicator` (check) migrated from custom inline SVG to `<ChevronDown>` and `<Check>` from
  Lucide.

**Impact:** `packages/web-ui/package.json` (+1 dep), `packages/web-ui/src/ui/Select/Select.tsx`, all
`*.stories.tsx` files that had inline SVG.

---

## [2026-06-22] — MTG primitives: SVG clipPath for hybrid pip split + packages/domain placement

**Context:** Session 10 — MTG primitive components (ManaIcon, ManaSymbol, HybridManaSymbol,
ManaCost, ColorIdentity) and domain functions (parseManaCost, sortColorIdentity,
getColorIdentityName).

**Decisions:**

- **Diagonal hybrid split via SVG clipPath triangles** — top-left triangle
  `polygon points="0,32 0,0 32,0"` clips the first color half; bottom-right
  `polygon points="32,0 32,32 0,32"` clips the second. Matches the appearance of physical MTG cards.
  Icons scaled at 0.4× and offset within each half.
- **`useId()` + `.replaceAll(/[^a-zA-Z0-9]/g, '')` for SVG IDs** — React's `useId()` returns IDs
  like `:r0:` containing colons, which are invalid in SVG `id` attributes when referenced via
  `url(#id)`. Stripping non-alphanumeric characters produces safe, unique IDs per component
  instance.
- **`HybridManaSymbol` is self-contained** — renders its own pip container + SVG fill. `ManaIcon` is
  pure SVG icon only (no pip, no colors). `ManaSymbol` is the router. This separates concerns
  cleanly and avoids the old mixing of pip styling inside `HybridManaIcon`.
- **`packages/domain` is shared, not frontend-specific** — `MtgColor` and domain functions live in
  `packages/domain` (used by both `apps/api` and `apps/web`). Per ADR-0016, `apps/web` should
  receive pre-computed values (e.g. `colorIdentityName`) from API DTOs rather than calling domain
  functions directly. Current placement is correct; DTOs will carry the name string.
- **No re-exports through intermediate files** — consumers import `MtgColor` directly from
  `@decksmith/domain`, never via `hybrid-defs.ts` or any re-exporting barrel. Each file imports from
  its canonical source.
- **WUBRG-sorted keys in `getColorIdentityName` lookup** — all multi-color keys must be sorted in
  WUBRG order (W=0 U=1 B=2 R=3 G=4). E.g. Selesnya = `wg` not `gw`, Simic = `ug` not `gu`, Naya =
  `wrg` not `rgw`. Always produced by running `sortColorIdentity` before joining.
- **`text-text-muted` for readable story table content** — `text-text-faint` (2.5:1) fails WCAG AA
  and is decoration-only per the design system. All story table strings use `text-text-muted`.

**Impact:** `packages/domain/` (new package, 3 functions, 30 tests), `packages/web-ui/src/mtg/`
(ManaIcon, HybridManaSymbol, ManaSymbol, ManaCost, ColorIdentity + stories),
`packages/web-ui/package.json` (added `@decksmith/domain` dep).

---

## [2026-06-21] — Worldclass audit: Card alignment + dead TS token layer deleted

**Context:** Session 9 — full audit of Card components and `packages/tokens` against the
`core/Card.jsx` canonical reference.

**Decisions:**

- **Card hover lift corrected −3px → −2px** — `core/Card.jsx:30` uses `translateY(-2px)`. Our
  implementation had used −3px (copied from `DeckCard`, a heavier tile component). Fixed in
  `Card.tsx` and `ButtonCard.stories.tsx`.
- **`hover:bg-surface-hover` removed from interactive cards** — the reference keeps surface constant
  on hover; hover is signalled by `border-accent` + accent glow + lift only. We removed
  `hover:bg-surface-hover` and `focus-visible:bg-surface-hover` from `interactiveCardClasses`.
- **Dead TS token layer deleted** — `primitives/`, `semantic/colors.ts`, `native/index.ts`,
  `index.ts` removed; `"."` JS export removed from `package.json`. Nothing imported
  `@decksmith/tokens` as JS (verified with `git grep`). The TS layer had silently drifted
  (`primitives/shadows.ts` held legacy all-black values) while `tokens.css` was updated — a dead
  "source of truth" is strictly worse than none. See ADR-0017 for the full rationale.
- **Font fallbacks hardened** — `-apple-system` added to `--font-display`/`--font-body`; `'SF Mono'`
  added to `--font-mono` for better pre-load behavior on macOS/iOS.
- **`tokens.css` header documents source-of-truth status** — explicitly notes that Style Dictionary
  (Phase 14) will generate dual outputs from this file; edit here and nowhere else.

**Impact:** `packages/tokens/src/` (9 files deleted + `tokens.css` + `package.json` + `tsconfig`),
`packages/web-ui/src/ui/Card/Card.tsx`, `packages/web-ui/src/ui/Card/ButtonCard.stories.tsx`,
`apps/docs/adr/0017-packages-tokens-architecture.md`

---

## [2026-06-17] — Storybook CI: axe-playwright + pnpm binary isolation

**Context:** Session 8 — wiring `@storybook/test-runner` + `axe-playwright` into CI. Several
non-obvious choices made during setup.

**Decisions:**

- `playwright` added as a **direct** devDependency in `apps/storybook` (not just transitive via
  `@storybook/test-runner`) — pnpm doesn't hoist binaries from transitive deps; the binary must come
  from a direct dep for `pnpm exec playwright` to work in CI.
- CI pattern: `storybook build` → `http-server storybook-static -p 6006 --silent &` → `until curl`
  health-check → `test-storybook --url http://localhost:6006 --ci` — serves the static build locally
  rather than a full Playwright browser launch; avoids Storybook dev server instability in CI.
- `storyContext.parameters?.['a11y']?.disable` (bracket notation) instead of
  `parameters?.a11y?.disable` — TypeScript 6 strict index signature access (TS4111).
- Stories showing intentionally low-contrast tokens (Design System pages, `Text/Tones`) get
  `parameters: { a11y: { disable: true } }` — these document design tokens, not user-facing UI.
- Disabled component stories get `parameters: { a11y: { disable: true } }` — WCAG 1.4.3 explicitly
  exempts disabled controls from contrast requirements.
- `noop` implemented as `function noop(): void { return; }` (named function with explicit `return;`)
  — the three common alternatives all trigger oxlint: `() => {}` → `no-empty-function`,
  `() => undefined` → `no-useless-undefined`, `() => void 0` → rejected as unclean. A statement body
  satisfies `no-empty-function`; explicit `return;` is idiomatic.
- `packages/utils` scaffolded as a proper workspace package (not a barrel in `packages/web-ui`) —
  `noop` is reusable cross-package; keeping it in `utils` avoids coupling.
- `use-prefers-reduced-motion.ts` filename (kebab-case) — oxlint `unicorn/filename-case` requires
  kebab-case or PascalCase for non-component files.

**Impact:** `.github/workflows/ci.yml`, `apps/storybook/package.json`,
`apps/storybook/.storybook/test-runner.ts`, `packages/utils/`, `packages/web-ui/src/hooks/`,
`packages/web-ui/src/ui/*/**.stories.tsx`

---

## [2026-06-13] — InputGroup, Field, Button polish: component patterns and Tailwind v4 quirks

**Context:** Session 7 — building InputGroup, Field, and polishing Button in `packages/web-ui`.
Several non-obvious choices required during implementation.

**Decisions:**

- `[&:has(...)]` arbitrary variant instead of built-in `has-[...]` — the built-in form generates no
  CSS in our Vite + Storybook setup. All `:has()` selectors use the arbitrary form.
- Descendant combinator `_` (not direct child `>`) for SVG sizing in `InputGroupButton` — SVGs
  passed as `children` to `Button` sit inside Button's inner `<span>`, so `[&>svg]` misses them;
  `[&_svg]` reaches them.
- `@source` with explicit glob (`**/*.{ts,tsx}`) in `preview.css` — Tailwind v4 Vite scanner doesn't
  hot-watch files created after startup; touching the CSS entry point forces a full rescan.
- shadcn Field (pure HTML) over Base UI Field (`@base-ui/react/field`) — TanStack Form manages all
  validation state externally; using Base UI Field would add a second validation layer that
  conflicts.
- `FieldLabel` uses Eyebrow style
  (`font-mono text-xs uppercase tracking-wide font-semibold text-text-muted`) — MTG identity, fully
  semantic token–based, readable at label scale.
- `FieldError.errors` typed as `(string | undefined)[]` (not `{ message?: string }[]`) — TanStack
  Form's `field.state.meta.errors` format differs from react-hook-form; deduplication via `Set`.
- Button `destructive` variant: subtle background (`bg-error-subtle`) at rest, fills to `bg-error`
  on hover — communicates danger without alarming the user in an idle state.
- `active:duration-instant` on Button base — 50ms snap-down for tactile press feel; resets to 0ms in
  `prefers-reduced-motion` (handled in `tokens.css`).

**Impact:** `packages/web-ui/src/ui/InputGroup/`, `packages/web-ui/src/ui/Field/`,
`packages/web-ui/src/ui/Button/Button.tsx`, `packages/web-ui/src/ui/Separator/Separator.tsx`,
`apps/storybook/.storybook/preview.css`, `apps/docs/context/pitfalls/frontend.md`

---

## [2026-06-11] — Storybook Design System stories: co-location + CSS var patterns

**Context:** Building 6 token doc pages (Colors, Typography, Spacing, Radius, Shadows, Motion)
required decisions on file placement, theming approach, and how to resolve design tokens at runtime
in Storybook.

**Decisions:**

- Stories co-located in `packages/web-ui/src/design-system/` (not `apps/storybook/stories/`) —
  closer to the tokens they document, picked up via `{ directory, titlePrefix, files }` entry in
  `main.ts`
- Shadow demo components use `cssValue="var(--shadow-card)"` (live CSS var) rather than hardcoded
  rgba strings — changes to `tokens.css` reflect immediately in stories
- `MotionDemo` passes direct CSS values (`durationMs`, `easingCss`) rather than `var(--token)`
  references for `transition` — static `@theme` tokens don't always resolve reliably in inline
  styles in Storybook renderers
- Dark mode shadows use rim-light (`0 0 0 1px rgba(168,162,204,X)`) not drop shadows — the `#0f0e17`
  background is too dark for any darkening effect to be visible

**Impact:** `packages/web-ui/src/design-system/`, `_doc-components.tsx`,
`packages/tokens/src/web/tokens.css`

---

## [2026-06-11] — Semantic shadow tokens: shadow-popover / shadow-card / shadow-overlay

**Context:** The scale tokens (`shadow-sm/md/lg`) were being used directly in components, creating
the same drift risk as using raw radius scale tokens.

**Decision:** Added three semantic roles + one accent glow, following the same philosophy as
`radius-interactive/surface/modal/badge`:

- `shadow-popover` = `shadow-sm` — tooltips, hints, small dropdowns
- `shadow-card` = `shadow-md` — cards, panels, menus (default surface)
- `shadow-overlay` = `shadow-lg` — modals, drawers, maximum elevation
- `shadow-accent` — mode-specific glow (violet light, violet-muted dark); card hover =
  `shadow-card + shadow-accent`

**Impact:** `packages/tokens/src/web/tokens.css`, all skill components, `identity.md`, `DESIGN.md`

---

## [2026-06-10] — Typography tokens completed: leading, tracking, font-body

**Context:** `packages/tokens` was missing line heights and letter spacing, causing browser defaults
to apply. Discovered when implementing `Heading` and cross-referencing the decksmith-design skill.

**Decision:** Added to `@theme` static block in `tokens.css`:

- `--leading-xs` through `--leading-4xl` — paired with type scale, tighten as size grows (4xl: 1.1)
- `--tracking-tight: -0.02em` / `--tracking-normal: 0em` / `--tracking-wide: 0.04em`
- `--font-body` — same as `--font-display` (Outfit), semantically distinct for future flexibility

**Impact:** `Heading` CVA now pairs each `size` with its `leading-*` class and applies
`tracking-tight` by default. `Heading` size range capped at 4xl (aligned with decksmith-design
skill); 5xl/6xl remain in tokens as escape hatch via `className`.

---

## [2026-06-10] — `cva` + `clsx` + `tailwind-merge` added to `packages/web-ui`

**Decision:** Three standard utilities for component authoring in `packages/web-ui`:

- `class-variance-authority` (CVA) — type-safe variant definitions; replaces ad-hoc ternaries in
  `className`
- `clsx` — conditional class joining
- `tailwind-merge` — resolves Tailwind class conflicts when consumers pass `className` overrides

`cn(...inputs)` helper lives in `packages/web-ui/src/lib/cn.ts` and is used by every component.

---

## [2026-06-10] — `errorCode` on hook return instead of `isApiError` in components

**Context:** TanStack Query hooks return `error: Error | null`. Consumers need to branch on the
error type to show the right message.

**Decision:** Each hook spreads `UseQueryResult` and adds `errorCode: ErrorCode | null`. The hook
does the `isApiError` narrowing once internally; components receive a plain string or null.

**Impact:** `useUser`, `useUserPreferences` — and all future hooks follow the same pattern. No
`isApiError` import needed in feature components.

---

## [2026-06-10] — `packages/test-utils` created to share test infrastructure

**Context:** Both `packages/api-client` and `packages/query` need MSW server lifecycle + factory
helpers. Duplicating them would diverge quickly.

**Decision:** New `packages/test-utils` package with three exports: `./server` (MSW lifecycle),
`./query-wrapper` (`createQueryWrapper` with `QueryClientProvider` only), and per-entity
`./factories/*`. Critically, `test-utils` does NOT include `ApiClientProvider` — that would create a
circular dependency (`test-utils → packages/query → test-utils`). Each consuming package wraps
`QueryWrapper` with its own providers locally.

**Impact:** New `packages/test-utils/` in the monorepo. `packages/query` and `packages/api-client`
both depend on it as a devDependency.

---

## [2026-06-10] — React Context pattern for `ApiClient` distribution in `packages/query`

**Context:** Hooks in `packages/query` need access to an `ApiClient` instance. Three options were
considered: (1) `configure(client)` module-level singleton, (2) factory `createUseUser(client)`, (3)
React Context with `ApiClientProvider`.

**Decision:** React Context (`ApiClientProvider` + `useApiClient`). The client is immutable so there
is no re-render risk. It follows the same pattern as `QueryClientProvider` which consumers already
understand, and it doesn't require every hook to accept a `client` parameter.

**Impact:** `packages/query/src/context/context.tsx`. `apps/web` will mount `<ApiClientProvider>`
near the root alongside `<QueryClientProvider>`.

---

## [2026-06-10] — `ErrorCode` union derived from schema constants via `typeof`

**Context:** `packages/schema/src/errors/codes.ts` exports string constants
(`const VALIDATION_ERROR = 'VALIDATION_ERROR'`). `packages/api-client` needs a typed `ErrorCode`
union without duplicating the string values.

**Decision:** `import type { VALIDATION_ERROR, ... }` (named imports of the constants) and build the
union as `typeof VALIDATION_ERROR | typeof VALIDATION_ERROR | ...`. TypeScript infers the literal
type from each constant. `import type *` + `ErrorCodes[keyof ErrorCodes]` was rejected — it produces
a wide `string` union and requires a namespace, which oxlint flags.

**Impact:** `packages/api-client/src/errors/errors.ts`.

---

## [2026-06-10] — `credentials: 'include'` on every fetch in `createFetcher`

**Context:** Auth tokens are stored in httpOnly cookies (ADR-0014). Every API request must send
them; `fetch` does not include cookies cross-origin by default.

**Decision:** `credentials: 'include'` hardcoded in `createFetcher` — not optional per call. SSR
route loaders (TanStack Start server-side) must not use this client; they forward cookies manually
via raw `fetch` with the request's `Cookie` header.

**Impact:** `packages/api-client/src/fetcher/fetcher.ts`. Documented in project-state.md.

---

## [2026-06-09] — Oxlint rules hardened: React, jsx-a11y, no-use-before-define

**Context:** `apps/web` scaffolded — first real React code in the repo. Default oxlint config had
the `react` and `jsx-a11y` plugins loaded but no rules enabled.

**Decisions:**

- `react/rules-of-hooks`, `react/jsx-key`, `react/button-has-type`, `react/no-unknown-property`,
  `react/jsx-no-target-blank`, `react/no-unstable-nested-components`, `react/no-danger` — critical
  correctness/security rules
- `react/jsx-pascal-case`, `react/self-closing-comp`, `react/no-array-index-key`,
  `react/jsx-no-useless-fragment`, `react/no-children-prop` — best practice rules
- `jsx-a11y/alt-text`, `anchor-is-valid`, `anchor-has-content`, `heading-has-content`, `aria-role`,
  `aria-props`, `aria-proptypes`, `label-has-associated-control`, `no-redundant-roles` —
  accessibility baseline
- `no-use-before-define: error` — enforces "component before Route" convention for all TanStack
  Router route files; catches const TDZ errors and prevents hoisting-reliant ordering
- `react/exhaustive-deps` confirmed as `DummyRule` in oxlint 1.69 — not yet implemented, revisit
  when oxlint adds support
- `*.gen.ts` added to `ignorePatterns` in both `.oxlintrc.json` and `.oxfmtrc.json` —
  `routeTree.gen.ts` is auto-generated by TanStack Router's Vite plugin and must not be linted or
  formatted

**Impact:** `.oxlintrc.json`, `.oxfmtrc.json` updated. All new rules pass on existing codebase with
0 errors.

---

## [2026-06-09] — TanStack Start v1: `@tanstack/react-start` (not `@tanstack/start`)

**Context:** Two distinct packages exist for TanStack Start. Wrong one initially installed.

**Decision:** `@tanstack/react-start` (1.168.25) is the current Vite-native v1 API.
`@tanstack/start` (< 1.x) is the deprecated Vinxi-based API — config file is `app.config.ts`,
scripts are `vinxi dev/build/start`. The correct v1 API uses `vite.config.ts` with `tanstackStart()`
from `@tanstack/react-start/plugin/vite`.

**Impact:** `apps/web/package.json`, `apps/web/vite.config.ts`. `app.config.ts` deleted. Documented
in `apps/docs/context/pitfalls/frontend.md`.

---

## [2026-06-09] — TanStack Router: `scrollRestoration` option replaces `<ScrollRestoration />`

**Context:** `<ScrollRestoration />` from `@tanstack/react-router` is deprecated since 1.170.

**Decision:** Pass `scrollRestoration: true` to `createRouter()` instead of rendering the component
in `__root.tsx`. Documented in `apps/docs/context/pitfalls/frontend.md`.

**Impact:** `apps/web/src/router.tsx`, `apps/web/src/routes/__root.tsx`.

---

## [2026-06-09] — Auth routes grouped under `_auth/` pathless layout

**Context:** Login and Register pages share a visual layout and could be at `/login` or
`/auth/login`.

**Decision:** Pathless layout `_auth.tsx` + folder `_auth/` — URLs stay `/login` and `/register`
(industry standard, password manager friendly) while sharing a layout component. TanStack Router `_`
prefix convention for groups without URL segment.

**Impact:** `apps/web/src/routes/_auth.tsx`, `apps/web/src/routes/_auth/login.tsx`,
`apps/web/src/routes/_auth/register.tsx`.

---

## [2026-06-09] — Router type augmentation auto-generated by TanStack Start

**Context:** TanStack Router docs suggest manually augmenting `@tanstack/react-router` Register
interface in `router.tsx`. TanStack Start's Vite plugin generates this automatically.

**Decision:** Do not add manual `declare module '@tanstack/react-router'` in `router.tsx`. The
`routeTree.gen.ts` codegen already augments `@tanstack/react-start` with the router type. Manual
augmentation duplicates this and can drift. Documented in `apps/docs/context/pitfalls/frontend.md`.

**Impact:** `apps/web/src/router.tsx` kept minimal.

---

## [2026-06-08] — Token system: interactive states and status triplets added

**Context:** Post-Session-A review caught missing tokens that will be needed from the first
component: interactive hover state, focus ring, and full status color triplets.

**Decisions:**

- `surface-hover` (`#2a2840` / `#ede9d8`) — subtle lift for hoverable surfaces (cards, list items)
- `border-focus` (= `accent`) — named separately from `accent` to signal accessibility intent
- Full triplets for all 4 status states: `{state}` (solid color) + `{state}-subtle` (tinted bg)
  - `{state}-text` (WCAG AA compliant on both bg colors)
- `warning` (`#f59e0b`) is orange-amber, distinct from `accent` (`#e8b84b` golden) — both
  amber-family but different purposes, must not be substituted
- `info` is a neutral UI blue (`#5b9cf6` / `#2563eb`) — never substitute `mtg-blue` (MTG color
  identity ≠ UI state)
- All light-mode `*-text` variants verified WCAG AA: error-text 9.4:1, success-text 7.0:1,
  warning-text 10.4:1, info-text 6.4:1

**Impact:** ADR-0017 updated (table + contrast section + evolution entry), DESIGN.md token list
updated, token-preview.html updated (new section + all color chips)

---

## [2026-06-08] — Session D: global test strategy validated (Phase 4.0.5)

**Context:** Conversational session to align on the full testing strategy before scaffolding
`apps/web`, `packages/web-ui`, and `packages/utils`. Decisions are documented in
`apps/docs/context/test-strategy.md` and ADR-0006 (evolution entry).

**Key decisions:**

- **`apps/storybook` as a separate app** — aggregates stories from `packages/web-ui` and
  `apps/web/src/components`. Stories remain colocated with their components.
- **`packages/utils`** — new package for pure cross-domain utilities (array, formatting). Test
  mental: "could this be used outside Decksmith?" Yes → `packages/utils`, No → `packages/domain`.
- **TDD on pure layers** — `packages/domain` and `packages/utils` use Red → Green → Refactor. All
  other layers use test-close (same session, before merge).
- **Real PostgreSQL for `apps/api`** — Docker service in CI, `beforeEach` truncate. Prisma is never
  mocked. Only Supabase Auth SDK HTTP calls mocked via `vi.mock`.
- **MSW for frontend tests** — network-level interception in Storybook (addon) and Vitest. TanStack
  Query hooks are never mocked directly.
- **Factory pattern** — colocated factories with sensible defaults and overrides. Seeds are for
  development data, not tests.
- **No coverage thresholds** — value criterion only: catches costly bugs, documents non-obvious
  behaviour, enables refactoring.
- **CI split** — unit + integration on every PR (< 3 min), E2E (Playwright) on `main` only.

**Impact:** `apps/docs/context/test-strategy.md` created, ADR-0006 evolution entry added

---

## [2026-06-08] — Session C: "production-ready component" definition validated (Phase 4.0.5)

**Context:** Before scaffolding `packages/web-ui`, aligned on what "done" means for a component and
how the package should be structured.

**Key decisions:**

- **`packages/web-ui` structure:** `ui/` (shadcn-generated), `components/` (custom Decksmith),
  `typography/` (`<Heading>`, `<Body>`, `<Label>`), `icons/` (custom animated SVG)
- **`packages/web-ui` vs `apps/web` boundary:** mental test — "could this component be used in
  another React app without modification?" Yes → `packages/web-ui`, No → `apps/web/src/components/`
- **Forbidden in `packages/web-ui`:** TanStack Router imports, TanStack Query hooks, Zustand,
  `packages/api-client` — no app coupling
- **Two levels of "done":** v1 (usable — 7 criteria) and Complete (stable — all v1 criteria + play
  functions, MDX, a11y-reviewer, motion tokens). v1 unblocks usage; Complete is earned through use.
- **Rule of 3:** never create a component speculatively — extract when a pattern repeats in 3
  distinct contexts
- **MDX anatomy:** each stable component has a `.mdx` with anatomy diagram, API table, dos/don'ts,
  a11y notes. `<Anatomy>` is a Storybook-only utility.
- **Comments:** JSDoc required on exports; inline comments only for non-obvious constraints (the
  _why_, never the _what_)

**Impact:** ADR-0019 created

---

## [2026-06-08] — Session B: frontend stack validated (Phase 4.0.5)

**Context:** Conversational review of all frontend technical aspects before scaffolding `apps/web`
and `packages/web-ui`. All decisions are documented in ADR-0018.

**Key decisions and corrections:**

- **shadcn/ui + Base UI** (not Radix) — first-class since January 2026, by the Radix authors
- **PDFKit** (not @react-pdf/renderer) — cards are images, pixel/mm precision required
- **Zustand added** — shared UI state (sidebar, search, nav) crosses component boundaries
- **Lucide** (not Phosphor) — native shadcn/ui icon system, guaranteed visual consistency
- **Icon animations** — custom SVG components with Motion, not Lottie or Lordicon
- **TanStack Virtual + Table** — missed in initial stack, essential (long lists, collection view)
- **@dnd-kit** — drag & drop for deck builder (Phase 7)
- **tinykeys** — keyboard shortcuts with chord sequence support
- **Native Intl** for dates — date-fns only if proven necessary
- **i18n rule from Phase 4** — no hardcoded strings, `t('key')` everywhere from the start

**Impact:** ADR-0018 created

---

## [2026-06-08] — Session A: `packages/tokens` architecture validated (Phase 4.0.5)

**Context:** Before scaffolding `packages/tokens`, ran a conversational session to validate the
complete token system architecture, with visual preview in `apps/docs/design/token-preview.html`.

**Decisions:**

- **2-layer hierarchy:** primitives → semantic. Component tokens added on demand (rule of 3
  repetitions), never speculatively.
- **Dual output:** `web/tokens.css` (`@theme` Tailwind v4, CSS vars) + `native/index.ts` (flat JS
  objects for React Native). Style Dictionary deferred to Phase 14.
- **Accent revised:** `#f59e0b` (Tailwind orange) replaced by `#e8b84b` (warm gold). Two new tokens:
  `on-accent` (`#0f0e17` — text on amber button) and `accent-text` (`#8a6a0c` in light mode — dark
  enough to pass WCAG AA on light backgrounds).
- **WCAG AA contrast:** all critical pairs verified and documented in ADR-0017. `text-faint`
  accepted as decorative only (2.5:1 — never for essential content).
- **Motion:** Mode A (micro 50–200ms, ease-out) + Mode B (key moments 300–500ms, ease-spring).
  Explicit separation: immediate feedback vs expressive narration.
- **Fluid typography:** `clamp()` via Utopia confirmed — no fixed breakpoints for type scale. Values
  generated during Phase 4.1 scaffold. Fonts self-hosted, `font-display: optional`.
- **Storybook:** Design System section required — palette, typography, spacing, motion, shadows,
  z-index — always live and synchronized with the real tokens.

**Impact:** ADR-0017 created · ADR-0015 updated · token-preview.html created in `apps/docs/design/`

---

## [2026-05-30] — DESIGN.md as @importable domain quick-reference convention

**Context:** Before starting Phase 4 (frontend), Claude needs design context loaded in every session
without reading the full `identity.md`, `decisions.md`, and all 7 screen mocks. The `CLAUDE.md`
context-import mechanism (used for roadmap + project-state) can serve the same purpose for design.

**Decision:** `apps/docs/design/DESIGN.md` is the canonical quick-reference for the design system —
key token values, non-negotiable rules, search patterns, nav patterns, and links to full docs. It is
@imported in `CLAUDE.md` alongside roadmap and project-state. This establishes a pattern: any domain
complex enough to have its own package or doc folder should have a corresponding `DOMAIN.md`
quick-reference that can be @imported.

**Impact:** `apps/docs/design/DESIGN.md` (new), `CLAUDE.md` (new @import + Design Rules section).

---

## [2026-05-30] — Design Rules section in CLAUDE.md (non-negotiable)

**Context:** Architectural Rules in `CLAUDE.md` prevent code-level violations (e.g., Prisma in wrong
packages). Design decisions have the same risk: future sessions could inadvertently use hardcoded
hex values, `dark:` Tailwind variants, or coloured circles for mana symbols — all explicitly
rejected decisions.

**Decision:** Added a Design Rules section to `CLAUDE.md` at the same level as Architectural Rules
(5 rules, non-negotiable). Rules are flagged the same way: if a suggestion violates them, Claude
must call it out before proceeding.

**Impact:** `CLAUDE.md` (new Design Rules section). Pattern: when a domain has established
non-negotiable constraints, they belong in `CLAUDE.md`, not only in docs files that may not be read.

---

## [2026-05-30] — Global search scope: cards + decks + collection

**Context:** The original `card-search.md` spec treated the header search as card-only search with
autocomplete. During design mockup work, the question arose: should search also cover the user's
decks and collection entries?

**Decision:** The header search bar is a **global search** — it searches MTG cards, user decks, and
collection entries simultaneously. Results are grouped by type (CARTES / DECKS / COLLECTION) in the
autocomplete dropdown. Each page (deck list, collection) keeps a separate local filter for filtering
items on the current page — distinct from global search.

**Impact:** `apps/docs/specs/card-search.md` (updated: "Search Bar" → "Global Search", grouped
results mock added), `apps/docs/design/screens/card-search.md` (Popover mock reflects 3 groups),
`apps/docs/design/decisions.md` (decision logged).

---

## [2026-03-30] — lint-staged glob extended to include .md files

**Context:** CI was failing on `pnpm format:check` because three markdown files in
`apps/docs/context/` had formatting issues that were never caught locally. The lint-staged glob had
been restricted to `*.{ts,tsx,js,jsx}` to fix a YAML issue — but markdown was incorrectly dropped in
the same change. oxfmt supports markdown fine.

**Decision:** Extended lint-staged glob to `*.{ts,tsx,js,jsx,md}`. YAML/JSON remain excluded (oxfmt
doesn't support them). The earlier decision log entry was wrong about markdown.

**Impact:** Root `package.json` lint-staged config. CI will no longer fail on markdown formatting.

---

## [2026-03-30] — Supabase error codes live in packages/db, not packages/schema

**Context:** During auth implementation, the Supabase SDK error code `user_already_exists` was
initially placed in `packages/schema/src/errors/codes.ts` alongside public API error codes. The
`api-reviewer` flagged this as a layering violation.

**Decision:** Supabase SDK error codes go in `packages/db/src/supabase-error-codes.ts`. The
distinction: `packages/schema` is the public API contract shared with the frontend — codes there are
i18n keys the client will `switch` on. Supabase codes are internal infrastructure strings used only
server-side to map SDK errors to public codes. Mixing them would expose implementation details and
pollute the frontend contract.

**Impact:** `packages/db/src/supabase-error-codes.ts` (new), `packages/schema/src/errors/codes.ts`
(Supabase codes removed), `apps/api/src/modules/auth/auth-routes.ts` (imports from correct package).

---

## [2026-03-30] — FastifyPluginCallbackZod over AsyncZod for auth routes

**Context:** The auth routes plugin was initially written as `FastifyPluginAsyncZod`. Oxlint's
`no-floating-promises` rule flagged the top-level `async` function as a floating promise. An
`eslint-disable` comment was added, but Oxlint ignores ESLint-style disable comments.

**Decision:** Switched to `FastifyPluginCallbackZod` (synchronous callback + `done()`). The
`async/await` syntax inside individual route handlers is unaffected — only the plugin wrapper
changes. This satisfies Oxlint without suppression and is the correct pattern for plugins that have
no top-level `await` outside route registrations.

**Impact:** `apps/api/src/modules/auth/auth-routes.ts`. Pattern to follow for future route files
that trigger the same lint rule.

---

## [2026-03-19] — Fastify module augmentation in dedicated .d.ts file

**Context:** The auth plugin needed to augment `FastifyInstance` and `FastifyRequest` with
`authenticate` and `user`. Placing `declare module 'fastify'` directly in `auth.ts` mixed type
declarations with business logic, and oxlint's `consistent-type-definitions` rule was flagging the
required `interface` keyword.

**Decision:** Extracted all Fastify type augmentations to `apps/api/src/types/fastify.d.ts`. Added a
`*.d.ts` override in `.oxlintrc.json` to allow `interface` in declaration files. This is the
standard TypeScript pattern for module augmentation.

**Impact:** `apps/api/src/types/fastify.d.ts` (new), `apps/api/src/plugins/auth.ts` (cleaner),
`.oxlintrc.json` (new override).

---

## [2026-03-19] — AuthUser type re-exported from @decksmith/db

**Context:** `apps/api` needed the Supabase `User` type for `req.user` typing, but importing
directly from `@supabase/supabase-js` in `apps/api` would create a direct coupling between the API
layer and the auth infrastructure.

**Decision:** Re-exported `User as AuthUser` from `packages/db/src/index.ts`. `apps/api` imports
`AuthUser` from `@decksmith/db` only — it has no knowledge of `@supabase/supabase-js`. The name
`AuthUser` is intentionally provider-agnostic.

**Impact:** `packages/db/src/index.ts`, `apps/api/src/types/fastify.d.ts`.

---

## [2026-03-19] — lint-staged glob restricted to TS/JS files only

**Context:** oxfmt was failing on `pnpm-lock.yaml` during commits because the lint-staged glob
`*.{ts,tsx,js,jsx,json,md,mdx,yml,yaml}` matched YAML files, which oxfmt doesn't support.

**Decision:** Restricted lint-staged glob to `*.{ts,tsx,js,jsx}` only. oxfmt only formats
JavaScript/TypeScript — JSON, Markdown, and YAML files are not supported and should not be passed to
it.

**Impact:** Root `package.json` lint-staged config.

---

## [2026-03-17] — Added @supabase/supabase-js to packages/db

**Context:** Phase 2.2 auth requires a server-side Supabase client to verify JWTs and perform admin
auth operations.

**Decision:** `@supabase/supabase-js` added to the pnpm catalog and as a dependency of
`packages/db`. The client uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS — server-only) with
`persistSession: false` and `autoRefreshToken: false` (server is stateless, sessions are managed
per-request via cookies). Exported as `supabase` from `@decksmith/db`.

**Why packages/db and not apps/api:** `packages/db` owns all infrastructure data concerns (Prisma +
Supabase). `apps/worker` will also need this client later. Avoids duplication and keeps the swap
surface isolated to one package (ADR-0005).

---

## [2026-03-17] — Supabase direct connection deprecated, switched to Session Pooler

**Context:** The direct PostgreSQL connection (`db.<ref>.supabase.co:5432`) no longer resolves via
DNS for this Supabase project. Supabase migrated to a pooler infrastructure.

**Decision:** `DATABASE_URL` now points to the **Session Pooler**
(`aws-[region].pooler.supabase.com:5432`). The Session Pooler is compatible with Prisma (persistent
connections, unlike the Transaction Pooler on port 6543 which is incompatible with Prisma
transactions).

**Impact:** `.env` and `.env.example` updated. Any developer cloning the repo must use the Session
Pooler URL from the Supabase dashboard → Settings → Database.

---

## [2026-03-17] — `User.id` must not be auto-generated by Prisma

**Context:** The `User` Prisma model had `@default(uuid())` on its `id`. This default was added
during initial schema design, before Supabase Auth was integrated. At that point, users only existed
in the public `users` table — created directly via the seed script (faker + Prisma), without any
authentication layer.

**Problem:** With Supabase Auth, every user is first created in `auth.users` (Supabase's internal
table), which generates a UUID. The public `users` table is a profile table that **must reference
that same ID**. If Prisma generates its own UUID, the two tables will have different IDs and RLS
policies (`auth.uid() = user_id`) will never work.

**Decision:** Remove `@default(uuid())` from `User.id`. The `User` ID is always passed explicitly
from the Supabase Auth ID at profile creation time.

**Impact:** `packages/db/prisma/schema.prisma` — migration required. The seed script must be updated
to no longer generate arbitrary UUIDs for users.

---

## [2026-03-17] — Auth API-proxied, not Supabase direct from the frontend

**Context:** See ADR-0014. Significant decision documented in full as an ADR.

---

## [2026-03-16] — tsgolint alpha: disable `tsconfig-error` rule

**Context:** Oxlint type-aware linting via `oxlint-tsgolint` triggered a false positive on `baseUrl`
in all four app tsconfig files (`apps/api`, `apps/web`, `apps/worker`, `apps/mobile`). The error
message "Option 'baseUrl' has been removed" is a tsgolint alpha bug (tracked in
oxc-project/tsgolint#351).

**Decision:** Removed `baseUrl` from all four tsconfig files (TypeScript 5+ supports `paths` without
it). Also disabled the `tsconfig-error` rule override in `.oxlintrc.json` as a safety net.

**Impact:** `apps/*/tsconfig.json` — removed `baseUrl: "."` from `compilerOptions`. Typecheck still
passes.

---

## [2026-03-16] — Oxlint `unicorn/no-useless-undefined` disabled for test files

**Context:** The `mergeJsonField` test explicitly passes `undefined` to test that code path.
Oxlint's `unicorn/no-useless-undefined` rule flagged it as unnecessary, but in this context it is
intentional — we are testing a specific parameter value, not omitting it by accident.

**Decision:** Added an `.oxlintrc.json` override to disable `unicorn/no-useless-undefined` for
`*.test.ts` / `*.spec.ts` files.

**Impact:** `.oxlintrc.json` overrides section. Affects all future test files.

---

## [2026-03-16] — Oxlint runs at workspace root, not per-package

**Context:** The old ESLint setup used `turbo run lint` (per-package). Oxlint can run at the root
and lint the entire monorepo in one pass (~200ms), making the turbo approach unnecessary.

**Decision:** `pnpm lint` → `oxlint .` from workspace root. The turbo `lint` task remains in
`turbo.json` for per-package dev convenience (`pnpm --filter @decksmith/api lint`) but the root
command no longer goes through turbo.

**Impact:** `package.json` root scripts. CI `lint` job no longer needs Prisma generate.

---

## [2026-03-16] — vitest installed at workspace root + per-package (not catalog)

**Context:** Vitest is a devDependency needed by `packages/config` (for the shared base config) and
each package that has tests. Adding it to the pnpm catalog would be correct long-term, but since
only `apps/api` has tests today, installing directly avoids premature catalog entries.

**Decision:** Vitest pinned in root `devDependencies` and `apps/api` `devDependencies`. Will move to
catalog once 2+ packages use it.

---

## [2026-06-22] — `packages/tokens` split into thematic sub-files

**Context:** `tokens.css` reached ~350 lines with all token categories in a single file. Adding MTG
rarity tokens (new) made the growth trajectory clear — the file would keep growing with every new
token domain.

**Decision:** Split into `colors.css`, `mtg.css`, `typography.css`, `layout.css`, `motion.css`.
`tokens.css` becomes a master `@import` entry point — the only file consumers reference. Tailwind v4
merges multiple `@theme` blocks across imported files, so no consumer changes are needed.

**Impact:** `packages/tokens/src/web/`. Import path `@decksmith/tokens/web/tokens.css` unchanged.

---

## [2026-06-22] — MTG rarity tokens added to `packages/tokens`

**Context:** `RarityBadge` component (upcoming) needs canonical rarity colors. These are part of the
MTG visual vocabulary like WUBRG — fixed, not theme-adaptive.

**Decision:** Four rarity tokens + four foreground tokens in `mtg.css` under static `@theme`:
`rarity-common` (#b8b8b8), `rarity-uncommon` (#8fa9bf), `rarity-rare` (#c8a951), `rarity-mythic`
(#e05c1e). Common uses mid-gray rather than black — pure black is invisible in dark mode. All
foreground contrast ratios WCAG AA verified (common 8.7:1, uncommon 5.7:1, rare 8.75:1, mythic
5.9:1).

**Impact:** `packages/tokens/src/web/mtg.css`. Generates `bg-rarity-*` and `text-rarity-*-fg`
Tailwind utilities.

---

## [2026-06-22] — `radius-stamp` semantic token replaces `radius-sm` exception

**Context:** The old rule used Tailwind's built-in `rounded-sm` with a required inline comment for
MTG stamp elements (format badges, rarity chips). This was an undocumented exception that relied on
a raw value rather than expressing intent.

**Decision:** `--radius-stamp: 0.25rem` added as a fifth semantic radius role in `layout.css`. The
raw radius scale (`radius-sm` through `radius-full`) removed entirely — Tailwind's built-in scale
uses different values anyway (e.g. `rounded-md` = 0.375rem ≠ our former `radius-md` = 0.5rem),
making the scale a source of confusion.

**Impact:** `packages/tokens/src/web/layout.css`, `Radius.stories.tsx` updated.

**Impact:** `package.json`, `apps/api/package.json`, `packages/config/package.json`.
