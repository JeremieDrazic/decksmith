# ADR-0023: Auth Guard via beforeLoad + SSR Cookie Forwarding

**Last Updated:** 2026-07-08 **Status:** Active **Context:** Decksmith

---

## Context

`apps/web` has protected routes (e.g. `/dashboard`) that must only be accessible to authenticated
users. Auth tokens live in `httpOnly` cookies managed by `apps/api` (ADR-0014 — API-proxied auth).
JavaScript cannot read these cookies, so the frontend cannot determine auth state locally — it must
make a network request to the API (`GET /api/v1/auth/me`) and let the API validate the token.

TanStack Start renders pages SSR-first (hard loads, refreshes, direct links). Two approaches were
considered for placing the guard:

1. **Component-based guard** — a React component that calls `useQuery` for `/me`, shows a skeleton
   while loading, and redirects once the result is known.
2. **`beforeLoad` guard** — a route-level hook that runs before any rendering, on the server during
   SSR and on the client during SPA navigation.

The product requirement is UX without flash and optimal performance, which rules out option 1.

A secondary problem: during SSR, the Node.js server has no browser cookie jar. If the server makes a
request to `apps/api`, it must manually forward the `Cookie` header from the incoming HTTP request —
the browser does not attach cookies automatically in server-to-server calls.

## Current Decision

Protected routes are placed under a pathless layout `_authenticated` that carries a `beforeLoad`
hook. The hook calls a `createServerFn` (`$getMe`) which forwards the incoming `Cookie` header to
`GET /api/v1/auth/me`. If the response is `null` (unauthenticated), `beforeLoad` throws a TanStack
Router `redirect` to `/login` (with `redirectTo` search param to restore the original path after
login). If authenticated, `beforeLoad` returns `{ user }`, injecting the user into the route context
for all child routes.

The API client fetcher (`packages/api-client`) gains an optional `headers` parameter so that
server-side callers can pass the forwarded `Cookie` header without coupling the forwarding logic
into the fetcher itself.

## Rationale

- **Separation of concerns**: the guard lives in routing infrastructure (`_authenticated`), not in
  feature components. Feature components read `user` from route context — they do not know or care
  how auth was verified.
- **Explicit data contracts**: `beforeLoad` returns a typed `{ user: User }` added to route context,
  inherited by all child routes. The `me()` method in `api-client` returns `User | null` — the
  `null` case is explicit, not an exception.
- **Deterministic behavior**: `beforeLoad` always runs before rendering, on both server and client.
  The outcome (redirect or context injection) is determined before any UI is painted — no race
  conditions, no transient states.
- **Clarity over cleverness**: `createServerFn` is the standard TanStack Start primitive for
  server-only logic callable from routes. `getWebRequest()` is the documented API for reading the
  incoming request. No custom middleware, no monkey-patching.

## Trade-offs

**Benefits:**

- Zero flash on hard load / refresh of protected routes — content is in the first HTML payload (SSR
  with data) or a 302 redirect is returned before any HTML is generated.
- SPA navigation to a protected route keeps the previous page visible while `beforeLoad` resolves —
  no skeleton state needed.
- Session expiry is detected on every navigation to a protected route, not just on mount — stale
  sessions are caught early.
- The `headers` param on the fetcher and the `$getMe` server function are reusable infrastructure
  for all future authenticated loaders.
- `redirectTo` search param on `/login` restores the user's original destination after login.

**Costs:**

- TTFB on hard load is higher than a skeleton approach: the server waits for `apps/api /me` to
  respond before sending any HTML.
- Each SPA navigation to a protected route triggers a server round-trip (RPC call to `$getMe`). This
  is acceptable and improves security (expired sessions are caught per navigation), but adds latency
  on slow connections. Can be mitigated later with `staleTime` caching if needed.
- `useMe()` hook is deferred — the route context (`Route.useRouteContext()`) is the primary way to
  access the current user inside protected pages. A `useMe()` hook would cause a redundant second
  fetch after hydration.

**Risks:**

- **Production domain requirement**: cookie forwarding only works if `apps/web` and `apps/api` share
  a cookie domain (e.g. `decksmith.app` + `api.decksmith.app` with `domain=.decksmith.app`). This is
  already a prerequisite of the API-proxied auth architecture (ADR-0014) — the browser must be able
  to send the `httpOnly` cookie to the API on all authenticated requests. No new constraint is
  introduced, but it must be verified during production deployment.
- `redirectTo` is stored as a plain string query param. It is validated to be a string on the login
  route but not verified to be an internal path. An open redirect attack is mitigated by using
  TanStack Router's `navigate({ to: redirectTo })` which resolves within the app's route tree — but
  this should be hardened with an explicit `/`-prefix check before production.

## Evolution History

### 2026-07-08: Initial decision

- Chose `beforeLoad` guard over component-based guard to eliminate flash on hard load/refresh.
- `createServerFn` (`$getMe`) encapsulates SSR cookie forwarding — callable from both server (inline
  during SSR) and client (RPC call during SPA navigation).
- Fetcher gains optional `headers` parameter for server-side authenticated calls.
- `redirectTo` search param added to `/login` for post-login destination restoration.
- `useMe()` hook deferred — route context is sufficient for all current protected pages.

## References

- ADR-0014: Auth API-proxied (cookie-based token strategy)
- ADR-0016: TanStack Start adoption (SSR/SPA hybrid, `createServerFn`)
- `apps/web/src/routes/_authenticated.tsx` — guard implementation
- `apps/web/src/lib/auth/get-me.ts` — `$getMe` server function
- `packages/api-client/src/modules/auth/auth.ts` — `me()` method
- `apps/api/src/modules/auth/auth-routes.ts` — `GET /api/v1/auth/me` endpoint
