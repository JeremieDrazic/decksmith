# ADR-0016: TanStack Start as the Web Framework for apps/web

**Last Updated:** 2026-05-31  
**Status:** Active  
**Context:** Decksmith

---

## Context

Phase 4.1 requires choosing a foundation for `apps/web`. The original plan was a plain SPA (Vite +
TanStack Router). Before starting, we evaluated whether TanStack Start — a full-stack meta-framework
built on TanStack Router — is a better fit.

**Key requirements driving this evaluation:**

1. Decksmith has public-facing content (public deck pages, card details, craft guide articles) that
   must be indexable by search engines and renderable as social previews.
2. The original workaround (ADR-0010 hybrid meta endpoint) is brittle — bot detection, redirect
   overhead, and a second implementation path that needs maintenance.
3. The authentication architecture (ADR-0014) uses httpOnly cookies, which are SSR-friendly by
   design.
4. `apps/mobile` is planned — the backend (`apps/api`) must remain a standalone API server.

**TanStack Start v1.0 was released March 2026.** It is the first stable version.

---

## Current Decision

**Adopt TanStack Start as the framework for `apps/web`**, with the constraint that `apps/api`
remains the sole backend. No server functions are used in `apps/web`. Route loaders call `apps/api`
via HTTP.

### SSR/CSR split by route

Routes are either SSR or CSR based on one rule: **public + indexable → SSR. Authenticated +
interactive → CSR.**

| Route                 | Rendering | Reason                                   |
| --------------------- | --------- | ---------------------------------------- |
| `/` (landing)         | SSR       | First impression, marketing, SEO         |
| `/cards/:id`          | SSR       | Card data indexable, social previews     |
| `/craft-guide/:slug`  | SSR       | Editorial content, SEO                   |
| `/decks/:id` (public) | SSR       | Public decks accessible anonymously, SEO |
| `/login`, `/register` | CSR       | No SEO value                             |
| `/dashboard`          | CSR       | Auth-required, personal data             |
| `/decks` (list)       | CSR       | Auth-required                            |
| `/collection`         | CSR       | Auth-required, interactive               |
| `/decks/:id/edit`     | CSR       | Highly interactive deck builder          |
| `/settings`           | CSR       | Auth-required                            |

After the initial page load, navigation between all routes — SSR and CSR alike — is client-side. The
user experiences a seamless SPA regardless of which routes are SSR or CSR.

### What TanStack Start adds over TanStack Router alone

| Feature                                   | Used in Decksmith                            |
| ----------------------------------------- | -------------------------------------------- |
| SSR + streaming                           | ✅ For public routes                         |
| Route loaders (server-side data prefetch) | ✅ For SSR routes                            |
| Middleware (auth guard, redirects)        | ✅ For protected routes                      |
| Unified Vite bundling                     | ✅ Replaces vite.config.ts                   |
| Server functions                          | ❌ Not used — see constraint below           |
| API routes                                | ❌ Not used — apps/api handles all API logic |

### Critical constraint: no backend code in apps/web

TanStack Start allows writing server functions and API routes inside `apps/web`. **We do not use
these features.** `apps/api` is the only backend.

The only thing route loaders in `apps/web` are permitted to do on the server side is fetch data from
`apps/api`:

```ts
// ✅ Correct: route loader calls apps/api
export const Route = createFileRoute('/decks/$id')({
  loader: async ({ params, context }) => {
    const res = await fetch(`${env.API_URL}/api/v1/decks/${params.id}`, {
      headers: { cookie: context.request.headers.get('cookie') ?? '' },
    });
    if (!res.ok) throw notFound();
    return res.json() as Promise<DeckResponse>;
  },
});
```

```ts
// ❌ Forbidden: direct DB access in apps/web
export const Route = createFileRoute('/decks/$id')({
  loader: async ({ params }) => {
    return prisma.deck.findUnique({ where: { id: params.id } }); // NEVER
  },
});
```

If a loader needs data that doesn't exist in `apps/api` yet, the answer is: **add an endpoint to
`apps/api` first, then call it from the loader.** Always.

### apps/web allowed and forbidden imports

**`apps/web` can import:**

- `packages/schema` — Zod DTOs for form validation and response types
- `packages/api-client` — typed HTTP client
- `packages/query` — TanStack Query hooks (for CSR data fetching)
- `packages/web-ui` — React components
- `packages/tokens` — design tokens

**`apps/web` cannot import:**

- `packages/db` — Prisma client (server-only)
- `packages/domain` — domain logic (server-only)
- `packages/scryfall` — external API client (server-only)
- `packages/pdf` — PDF generation (worker-only)

This constraint applies to route loaders as well. Loaders run on the server, but they are part of
`apps/web` and must respect these boundaries.

---

## Rationale

### Why TanStack Start instead of plain Vite + TanStack Router?

The core issue is public content. Decksmith has three content types that require SSR:

1. **Public deck pages** — must be indexable for SEO and social previews. ADR-0010 created a bot
   detection workaround for this. SSR eliminates the workaround.
2. **Card detail pages** — card data (oracle text, legalities, prices) is valuable search content.
   With SPA, Google must execute JavaScript to index it.
3. **Craft guide articles** — editorial content that should rank in search results.

Without SSR, these pages are blank `<div id="root"></div>` for crawlers.

### Why TanStack Start specifically?

TanStack Router is already decided for `apps/web` (CLAUDE.md). TanStack Start is not a framework
change — it is the full-stack layer built **on top of** TanStack Router. The router instance, file
conventions, hooks (`useNavigate`, `useParams`), and TanStack Query integration are identical.

Alternative frameworks (Next.js, Remix) would require adopting a different router and ecosystem,
rebuilding the planned architecture from scratch, and accepting Vercel lock-in (Next.js) or
web-standards-first constraints (Remix).

### Why no server functions?

Server functions in TanStack Start allow business logic to run server-side inside `apps/web`. This
would create a second backend alongside `apps/api`, violating ADR-0005 (package boundaries) and
undermining the planned mobile app architecture — `apps/mobile` cannot reuse server functions.
Keeping `apps/api` as the sole backend ensures one consistent API surface for all clients.

### Why SSR for public routes only?

Authenticated app routes (deck builder, collection manager, settings) are complex interactive UIs
with no SEO value. Server-rendering them adds latency and complexity without benefit. CSR is the
right choice for those routes.

### Auth compatibility

ADR-0014 established httpOnly cookies for session management. Cookies are automatically sent with
every HTTP request, including server-side fetches initiated by route loaders. No changes to the auth
architecture are required.

---

## Trade-offs

**Benefits:**

- Native SSR for public content — no bot detection workaround, no redirect overhead
- SEO for card pages, public decks, craft guide
- Same ecosystem as TanStack Router — zero cognitive shift
- Hybrid SSR/CSR — public pages are pre-rendered, app shell is SPA
- httpOnly cookie auth works identically with and without SSR
- Deployment-agnostic (Node.js, Cloudflare Workers, Vercel, etc.)

**Costs:**

- `apps/web` now requires a Node.js runtime at deployment (was previously static CDN)
- TanStack Start v1.0 is newer — fewer third-party examples and integrations than Next.js
- Route loaders add a second data-fetching pattern alongside TanStack Query hooks

**Risks:**

- **"Just one small DB import"**: The temptation to access `packages/db` directly from a loader will
  grow as the app scales. Mitigation: the constraint is enforced as an Architectural Rule in
  `CLAUDE.md`, not just documented here.
- **Ecosystem immaturity**: v1.0 released March 2026. Some edge cases may lack documentation.
  Mitigation: TanStack Router (the core) is stable and widely used.
- **RSC not yet available**: React Server Components are planned for a v1.x release. Not required
  for Decksmith's current scope.

---

## Evolution History

### 2026-05-31: Initial decision

- Evaluated TanStack Start v1.0 (released March 2026) as the foundation for `apps/web`
- Confirmed SSR for public routes, CSR for authenticated app routes
- Established constraint: no server functions, no backend code in `apps/web`
- ADR-0010 hybrid meta endpoint superseded — SSR handles link previews natively
- ADR-0005 updated with loader constraint

---

## References

- [TanStack Start documentation](https://tanstack.com/start/latest)
- [ADR-0005: Package Boundaries](./0005-package-boundaries-and-dependency-graph.md)
- [ADR-0010: Link Sharing Meta Tags](./0010-link-sharing-meta-tags.md) (superseded by this ADR)
- [ADR-0014: API-Proxied Auth](./0014-auth-api-proxied.md)
- [Spec: Deck Management](../specs/deck-management.md)
- [Spec: Craft Guide](../specs/craft-guide.md)
