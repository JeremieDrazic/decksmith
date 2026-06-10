# Decisions Log

Micro-decisions that don't warrant a full ADR. Ordered newest-first.

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

## [2026-06-08] — Session C : définition de "composant prêt à l'emploi" validée (Phase 4.0.5)

**Context:** Avant de scaffolder `packages/web-ui`, on a aligné sur ce que signifie "fini" pour un
composant et comment le package doit être structuré.

**Décisions clés :**

- **Structure `packages/web-ui`** : `ui/` (shadcn-generated), `components/` (custom Decksmith),
  `typography/` (`<Heading>`, `<Body>`, `<Label>`), `icons/` (SVG animés custom)
- **Frontière `packages/web-ui` vs `apps/web`** : test mental "ce composant peut-il être utilisé
  dans une autre appli React sans modification ?" Oui → `packages/web-ui`, Non →
  `apps/web/src/components/`
- **Interdit dans `packages/web-ui`** : imports TanStack Router, TanStack Query hooks, Zustand,
  `packages/api-client` — aucun couplage à l'app
- **Deux niveaux de "done"** : v1 (utilisable — 7 critères) et Complet (stable — tous les critères
  v1 + play functions, MDX, a11y-reviewer, tokens motion). La v1 débloque l'usage; le niveau complet
  est gagné par l'usage.
- **Règle des 3** : ne pas créer de composant par anticipation — extraire quand un pattern se répète
  dans 3 contextes différents
- **MDX anatomy** : chaque composant stable a un `.mdx` avec schéma d'anatomie, table API,
  dos/don'ts, notes a11y. `<Anatomy>` est un utilitaire Storybook uniquement.
- **Commentaires** : JSDoc requis sur les exports; commentaires inline uniquement pour les
  contraintes non-évidentes (le _pourquoi_, jamais le _quoi_)

**Impact:** ADR-0019 créé

---

## [2026-06-08] — Session B : stack frontend validée (Phase 4.0.5)

**Context:** Revue conversationnelle de tous les aspects techniques du frontend avant de scaffolder
`apps/web` et `packages/web-ui`. Toutes les décisions sont documentées dans ADR-0018.

**Décisions clés et corrections :**

- **shadcn/ui + Base UI** (pas Radix) — first-class depuis janvier 2026, par les auteurs de Radix
- **PDFKit** (pas @react-pdf/renderer) — les cartes sont des images, précision pixel/mm requise
- **Zustand ajouté** — l'état UI partagé (sidebar, search, nav) croise les frontières de composants
- **Lucide** (pas Phosphor) — système d'icônes natif shadcn/ui, cohérence visuelle garantie
- **Animations d'icônes** — composants SVG custom avec Motion, pas de Lottie ni de Lordicon
- **TanStack Virtual + Table** — oubliés dans la stack initiale, indispensables (listes longues,
  collection)
- **@dnd-kit** — drag & drop deck builder (Phase 7)
- **tinykeys** — raccourcis clavier avec support chord sequences
- **Intl natif** pour les dates — date-fns uniquement si besoin prouvé
- **Règle i18n dès Phase 4** — aucune string hardcodée, `t('key')` partout dès le début

**Impact:** ADR-0018 créé

---

## [2026-06-08] — Session A : architecture `packages/tokens` validée (Phase 4.0.5)

**Context:** Avant de scaffolder `packages/tokens`, on a conduit une session conversationnelle pour
valider l'architecture complète du système de tokens avec visualisation dans un fichier HTML de
preview (`apps/docs/design/token-preview.html`).

**Decisions:**

- **Hiérarchie 2 couches** : primitifs → sémantiques. Tokens composants ajoutés à la demande (règle
  des 3 répétitions), pas en avance.
- **Dual output** : `web/tokens.css` (`@theme` Tailwind v4, CSS vars) + `native/index.ts` (objets JS
  plats pour React Native). Style Dictionary reporté à Phase 14.
- **Accent revu** : `#f59e0b` (orange Tailwind) remplacé par `#e8b84b` (doré chaud). Deux nouveaux
  tokens : `on-accent` (`#0f0e17` — texte sur bouton amber) et `accent-text` (`#8a6a0c` en light —
  doré assez sombre pour passer WCAG AA sur fond clair).
- **Contraste WCAG AA** : toutes paires critiques vérifiées et documentées dans ADR-0017.
  `text-faint` accepté décoratif uniquement (2.5:1 — jamais pour contenu essentiel).
- **Motion** : Direction A (micro 50–200ms, ease-out) + Direction B (moments clés 300–500ms,
  ease-spring). Séparation explicite : feedback immédiat vs narration expressive.
- **Typo fluide** : `clamp()` via Utopia confirmé — pas de breakpoints fixes pour la typo. Valeurs
  générées lors du scaffold Phase 4.1. Fonts self-hosted, `font-display: optional`.
- **Storybook** : section Design System requise dans Storybook — palette, typo, spacing, motion,
  shadows, z-index — vivant et toujours synchronisé avec les tokens réels.

**Impact:** ADR-0017 créé · ADR-0015 mis à jour · token-preview.html créé dans `apps/docs/design/`

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

**Context:** La connexion directe PostgreSQL (`db.<ref>.supabase.co:5432`) ne résout plus en DNS
pour ce projet Supabase. Supabase a migré vers une infrastructure pooler.

**Decision:** `DATABASE_URL` pointe désormais vers le **Session Pooler** Supabase
(`aws-[region].pooler.supabase.com:5432`). Le Session Pooler est compatible avec Prisma (connexions
persistantes, contrairement au Transaction Pooler sur port 6543 qui n'est pas compatible avec les
transactions Prisma).

**Impact:** `.env` et `.env.example` mis à jour. Tout développeur qui clone le repo doit utiliser
l'URL Session Pooler depuis le dashboard Supabase → Settings → Database.

---

## [2026-03-17] — `User.id` ne doit pas être auto-généré par Prisma

**Context:** Le modèle `User` en Prisma avait `@default(uuid())` sur son `id`. Cette valeur par
défaut a été ajoutée lors de l'écriture initiale du schéma, avant que Supabase Auth soit intégré. À
ce stade, les users n'existaient que dans la table publique `users` — créés directement via le seed
script (faker + Prisma), sans aucune couche d'authentification.

**Problème:** Avec Supabase Auth, chaque utilisateur est d'abord créé dans `auth.users` (table
interne de Supabase), qui génère un UUID. La table publique `users` est une table de profil qui
**doit référencer ce même ID**. Si Prisma génère son propre UUID, les deux tables auront des IDs
différents et les politiques RLS (`auth.uid() = user_id`) ne fonctionneront jamais.

**Decision:** Retirer `@default(uuid())` sur `User.id`. L'ID de `User` sera toujours passé
explicitement depuis l'ID Supabase Auth au moment de la création du profil utilisateur.

**Impact:** `packages/db/prisma/schema.prisma` — migration nécessaire. Le seed script devra être mis
à jour pour ne plus générer d'UUID arbitraires pour les users.

---

## [2026-03-17] — Auth API-proxied, pas Supabase direct depuis le frontend

**Context:** Voir ADR-0014. Décision significative documentée en ADR.

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

**Impact:** `package.json`, `apps/api/package.json`, `packages/config/package.json`.
