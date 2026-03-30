# ADR-0014: API-Proxied Auth — Frontend Routes All Authentication Through apps/api

**Last Updated:** 2026-03-17 **Status:** Active **Context:** Decksmith

---

## Context

Decksmith uses Supabase Auth for user management. Supabase provides a JavaScript SDK
(`@supabase/supabase-js`) designed to be used directly in the frontend — login, register, OAuth, and
session management. This is the default pattern documented by Supabase.

Two approaches were possible:

**Option A — Supabase direct from the frontend (Supabase standard pattern)**

```
apps/web → @supabase/supabase-js → Supabase Auth
apps/api → verifies JWT on protected routes
```

The frontend handles login, register, and OAuth itself. It receives tokens directly from Supabase
and stores them (localStorage or memory). The API verifies tokens but does not issue them.

**Option B — API-proxied (chosen approach)**

```
apps/web → apps/api → Supabase Auth
apps/api → verifies JWT, sets httpOnly cookies
```

The frontend never talks to Supabase. It only calls `apps/api`. The API communicates with Supabase
Auth, receives the tokens, and places them in httpOnly cookies.

---

## Current Decision

All authentication flows through `apps/api`. The frontend (`apps/web`) does not depend on the
Supabase SDK and never handles tokens directly. Sessions are managed via httpOnly cookies set by the
API.

Auth routes are exposed under `/api/v1/auth/`.

---

## Rationale

### Respecting architectural boundaries

The foundational rule of Decksmith is: **all boundaries use DTOs from `packages/schema`**. If the
frontend called Supabase directly, it would bypass this boundary entirely. The contract would be
defined by the Supabase SDK, not our Zod schemas. Any change to the auth provider would impact the
frontend.

With the proxied approach, the frontend does not know Supabase exists. It sends
`{ email, password }` to `POST /api/v1/auth/login` and receives a user profile. If we change auth
providers in the future, only `apps/api` changes.

### Token security — httpOnly cookies vs localStorage

A **JWT token** is a signed string that proves a user's identity. The API can verify it without a
network call (the signature is sufficient).

The problem: where to store it on the client?

- **localStorage**: accessible from JavaScript → an XSS attack (malicious script injection) can read
  and exfiltrate the token. This is the most common attack vector.
- **httpOnly cookie**: set by the server, **never accessible from JavaScript**. An XSS script cannot
  read it. The browser sends it automatically with every request.

The proxied approach is the only one that enables httpOnly cookies, because it is the API that
receives the tokens and sets them. The frontend never sees them.

### Consistency with the "apps/\* orchestrate" principle

`apps/web` is responsible for UI and orchestrating API calls — not authentication logic. Managing
tokens, refreshing them, and detecting expiry are server-side responsibilities, not frontend
concerns.

---

## Trade-offs

**Benefits:**

- Tokens never exposed to JavaScript → XSS protection
- Frontend does not know Supabase exists → infrastructure is swappable without touching the frontend
- Auth contract defined by our Zod DTOs, not a third-party SDK
- Full consistency with the project's architectural rules
- Single entry point for everything: `apps/api`

**Costs:**

- More code to write: auth routes, JWT plugin, cookie management in `apps/api`
- The standard Supabase pattern (frontend direct) is better documented with more examples online
- Supabase frontend helpers (`useUser()`, etc.) cannot be used — equivalents must be implemented in
  `packages/query`

**Risks:**

- Refresh token management becomes the API's responsibility — if poorly implemented, sessions will
  expire silently on the client
  - **Mitigation**: explicit `/api/v1/auth/refresh` endpoint + automatic refresh logic in
    `packages/query`
- `SameSite=Strict` cookies complicate OAuth scenarios (cross-origin redirect)
  - **Mitigation**: use `SameSite=Lax` for session cookies, `Strict` for sensitive actions

---

## Evolution History

### 2026-03-17: Initial decision

- Decision made at the start of Phase 2.2 (Auth)
- Alternative evaluated: Supabase JS SDK directly in `apps/web`
- Rejected because it violates ADR-0005 (package boundaries) and exposes tokens client-side
- Proxied approach adopted for architectural consistency and httpOnly cookie security

---

## References

- [Spec: User Authentication](../specs/user-auth.md)
- [ADR-0005: Package Boundaries and Dependency Graph](./0005-package-boundaries-and-dependency-graph.md)
- [ADR-0001: Use Fastify as Web Framework](./0001-use-fastify-as-web-framework.md)
- [OWASP: XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
