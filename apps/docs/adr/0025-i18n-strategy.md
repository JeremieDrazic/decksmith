# ADR-0025: Internationalisation Strategy

**Last Updated:** 2026-07-14 **Status:** Active **Context:** Decksmith

---

## Context

`apps/web` has had `react-i18next` since session 14 with EN and FR locale files at
`apps/web/src/locales/`. However, two gaps remained unresolved:

1. **Zod validation errors in `packages/schema` contain hardcoded English strings** —
   `"Email must be valid"`, `"Password must be at least 8 characters"`, etc. These strings reach the
   client verbatim through the Fastify error handler and are displayed in the UI, bypassing i18n
   entirely.

2. **No architectural decision on who translates** — three options were considered:
   - **Option A**: API sends error codes, client translates
   - **Option B**: API reads `Accept-Language` and sends translated strings
   - **Option C**: hybrid (codes for Zod errors, translated messages for business errors)

A third gap was identified: `apps/web` owns all translation files today. `apps/mobile` (Phase 14)
will need the same translations. Without a shared package, translations would be duplicated and
could diverge.

## Current Decision

### 1. The API sends codes, not strings

Translation is a UI concern. The API's responsibility is to enforce rules and return stable,
machine-readable identifiers. `apps/api` does not read `Accept-Language` and does not produce
translated strings.

Every error that reaches a client has a `code` field — a stable string constant that the client maps
to a localised message:

```json
{ "code": "EMAIL_INVALID" }
{ "code": "EMAIL_ALREADY_TAKEN" }
{ "code": "INVALID_CREDENTIALS" }
```

This applies to all three error sources:

| Source         | Path to client                                                     | Code origin                              |
| -------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| Zod validation | `packages/schema` → Fastify error handler → client                 | Zod `message` field set to a code string |
| Business error | `packages/services` → `ServiceError.code` → error handler → client | `ServiceError(code, ...)`                |
| Supabase error | `packages/services` maps to `ServiceError`                         | Same as business error                   |

Option B (API translates) was rejected: it requires the API to load translation resources, handle
locale negotiation, and return locale-dependent responses — none of which is the API's job. It also
makes API contract tests locale-dependent, and adds coupling for future clients (mobile, CLI) that
would be forced to send `Accept-Language`.

Option C (hybrid) was rejected: two behaviours for the same problem adds unnecessary complexity and
makes error handling inconsistent on the client.

### 2. `packages/i18n` — shared translation package

All translation files live in `packages/i18n`. Both `apps/web` and `apps/mobile` (Phase 14) import
from this package. This is the single source of truth for every user-facing string.

`packages/i18n` contains:

- **Locale JSON files** organised by feature namespace (see section 3)
- **TypeScript types** derived from the JSON structure for type-safe translation keys
- **No runtime logic** — no i18n library, no `t()` function, no React context

Each app configures its own i18n runtime (`react-i18next` for web, `i18next` + Expo Localization for
mobile) and points it at the resources from `packages/i18n`.

### 3. Namespace strategy

Translation files are organised by feature, not by platform. Mobile-specific strings are colocated
with web strings under the same namespace — namespacing by feature is more maintainable than
namespacing by platform, and avoids premature separation before mobile is built.

```
packages/i18n/
  locales/
    en/
      auth.json       ← login, register, forgot-password strings
      errors.json     ← all error code → message mappings
      common.json     ← shared labels, actions, navigation
      settings.json   ← user preferences, language, theme
    fr/
      auth.json
      errors.json
      common.json
      settings.json
  src/
    index.ts          ← re-exports types
    types.ts          ← TypeScript key types derived from JSON
```

The existing `apps/web/src/locales/en.json` and `fr.json` are split into these namespaces and moved
to `packages/i18n`.

### 4. Type-safety

`packages/i18n` exports TypeScript types derived from the English locale files. This ensures that
translation keys used in components are always valid and that new codes added to the API are flagged
as untranslated at compile time.

```ts
// packages/i18n/src/types.ts
import type enErrors from '../locales/en/errors.json';
import type enAuth from '../locales/en/auth.json';
import type enCommon from '../locales/en/common.json';

export type ErrorTranslationKey = keyof typeof enErrors;
export type AuthTranslationKey = keyof typeof enAuth;
export type CommonTranslationKey = keyof typeof enCommon;
```

`apps/web` configures react-i18next with these types to enable TypeScript autocompletion on `t()`.

### 5. Zod error codes in `packages/schema`

All Zod `message` options are replaced with stable code strings. These codes become keys in
`packages/i18n/locales/*/errors.json`.

```ts
// before
z.string().email('Email must be valid');

// after
z.string().email('EMAIL_INVALID');
```

The Fastify error handler already serialises Zod errors. It passes the `message` field (now a code)
as-is to the client — no change to the error handler is needed.

`packages/schema` contract tests are updated to assert codes, not English strings. This makes them
locale-independent and more stable.

### 6. `ErrorCode` stays in `packages/schema`

`ErrorCode` (the union type covering all business error codes) is a data contract between the API
and its clients. It stays in `packages/schema`. `packages/i18n` does not define codes — it only
provides translations for them.

This preserves the existing dependency direction: `packages/api-client` derives `ErrorCode` from
`packages/schema`, and `packages/query` uses it. No circular dependency is introduced.

## Rationale

- **Separation of concerns**: translation is a UI concern; the API is locale-agnostic. Each layer
  has one reason to change.
- **Single source of truth**: all user-facing strings live in `packages/i18n`. Adding a language
  means adding one folder — no changes across apps.
- **Stable contracts**: Zod `message` fields are now codes, not prose. Contract tests no longer
  break when copy is revised.
- **Mobile readiness**: `packages/i18n` is plain JSON + TypeScript types — no React, no DOM. It
  works in any runtime.

## Trade-offs

**Benefits:**

- API tests are locale-independent.
- Adding a language requires changes in one package only.
- `apps/mobile` shares translations without duplication.
- Type-safe translation keys catch missing translations at compile time.

**Costs:**

- All existing Zod `.message` strings in `packages/schema` must be replaced with codes — a one-time
  migration with a defined scope.
- `packages/schema` contract tests must be updated to assert codes.
- `apps/web/src/locales/` is deleted; i18n initialisation in `apps/web` is updated to import
  resources from `packages/i18n`.

**Risks:**

- **Key explosion**: every error code needs a translation entry. Missing entries silently fall back
  to the key string (e.g. `"EMAIL_INVALID"` displayed raw). Mitigation: TypeScript types enforce
  completeness at build time.
- **Namespace sprawl**: too many namespaces make key lookup harder. Mitigation: start with 4
  namespaces (auth, errors, common, settings) and add only when a feature warrants clear separation.

## Evolution History

### 2026-07-14: Initial decision

- Option A adopted: API sends codes, client translates.
- `packages/i18n` created as a new shared package (JSON + TypeScript types, no runtime).
- All translation files migrated from `apps/web/src/locales/` to `packages/i18n/locales/`.
- Namespace strategy: by feature (auth, errors, common, settings).
- Zod messages in `packages/schema` replaced with code strings.
- `ErrorCode` stays in `packages/schema` — it is a data contract, not a UI resource.

## References

- ADR-0005: Package Boundaries and Dependency Graph
- ADR-0014: Auth API-proxied (error flow from Supabase → ServiceError → client)
- ADR-0024: Service Layer Architecture (`ServiceError` as the business error type)
- `packages/schema/src/` — Zod DTOs being migrated
- `apps/web/src/i18n.ts` — react-i18next initialisation (to be updated)
- `apps/docs/roadmap.md` — Phase 5 (i18n), Phase 14 (mobile)
