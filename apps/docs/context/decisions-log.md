# Decisions Log

Micro-decisions that don't warrant a full ADR. Ordered newest-first.

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
