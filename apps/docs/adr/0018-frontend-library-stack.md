# ADR-0018: Frontend Library Stack

**Last Updated:** 2026-06-08 **Status:** Active **Context:** Decksmith

---

## Context

Before scaffolding `apps/web` and `packages/web-ui`, all frontend library choices were validated
during Session B (Phase 4.0.5) — a dedicated conversational review covering every technical aspect
of the frontend stack. Decisions were made with the following constraints in mind:

- TanStack ecosystem coherence (Start, Query, Form, Table, Virtual)
- No server-side code in `apps/web` (ADR-0016)
- `packages/tokens` architecture already locked (ADR-0017)
- Future mobile app (`apps/mobile`) must not be blocked by web-specific choices
- Learning context: decisions must be explainable, not just pragmatic

---

## Current Decision

### SSR / Routing — TanStack Start

Already decided in ADR-0016. Validated here: TanStack Start keeps `apps/api` as the sole backend,
preventing the erosion of the frontend/backend boundary that Next.js Server Actions and Route
Handlers would introduce over time.

### Data Fetching — TanStack Query

- Global default `staleTime: 30_000` (30s) — overridden per query as needed
- `@tanstack/react-query-devtools` in dev, auto-excluded from prod build
- Data chain: `component → packages/query hook → packages/api-client → apps/api`
- Components never call `fetch` directly

### UI Primitives — shadcn/ui + Base UI

shadcn/ui is used as the component scaffolding CLI (not an npm dependency — it copies source code
into `packages/web-ui`). **Base UI** (by MUI, `@base-ui/react`) replaces Radix UI as the underlying
headless primitive layer.

Rationale: Base UI reached first-class support in shadcn/ui in January 2026. Its authors include
contributors from Radix UI and Floating UI — it is effectively the next generation of those
libraries. Chosen at `npx shadcn create` time; all subsequent `npx shadcn add` commands use Base UI
automatically.

### Styling — Tailwind v4 CSS-first

Documented in ADR-0017. No `tailwind.config.ts` — CSS-first via `@import "tailwindcss"` and
`@theme { … }`. Oxide engine (Rust) detects files automatically.

### Forms — TanStack Form + Zod

TanStack Form for consistency with the TanStack ecosystem. Zod schemas (from `packages/schema`) are
reused directly for validation — no duplication between API DTOs and form validation.

### Animation — CSS + Motion

- **CSS** (`transition`, `@keyframes`) for micro-interactions (hover, focus, toggles)
- **Motion** (`motion/react`) for moments clés (modals, drawers, route transitions, deck add)
- **Custom SVG components** for contextual icon animations (bell, trash, heart, etc.) — animate
  Lucide SVG paths directly with Motion. No Lottie, no separate icon system.
- Lottie reserved for 2–3 celebratory one-off moments (success states) if needed later.

See ADR-0017 for motion duration/easing tokens.

### Icons — Lucide + Motion on SVG paths

Lucide is the native icon set of shadcn/ui. All generated components use Lucide — keeping one icon
system across `packages/web-ui` ensures visual consistency. Hover animations via Motion `whileHover`
/ `whileTap` on SVG elements. Icons requiring contextual animation (bell, trash, settings) are built
as custom React components animating individual SVG paths.

### State Management

| State type                                    | Solution                                    |
| --------------------------------------------- | ------------------------------------------- |
| Server state (decks, cards, collection, user) | TanStack Query                              |
| Shared UI state (sidebar, search, mobile nav) | Zustand                                     |
| Local component state (forms, hover, scroll)  | useState / useReducer                       |
| Scoped feature state (deck builder)           | useReducer + React context, scoped to route |

Rule: Zustand for state shared between unrelated components. Not for server data.

### Keyboard Shortcuts — tinykeys

`tinykeys` over `react-hotkeys-hook` for its chord sequence support (`g d` → go to decks, `g c` → go
to collection, `/` → open search). Framework-agnostic, minimal bundle.

### Utilities — Native JS first

No lodash or es-toolkit added upfront. Native JS (`Array.prototype` methods, optional chaining,
`Object.groupBy`, etc.) is sufficient for current needs. es-toolkit added if a pattern of
reimplemented helpers emerges.

### Dates — Intl native

`Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` for formatting and relative time display. Both
handle locale natively — compatible with Phase 5 i18n (react-i18next). `date-fns` added only if
complex date arithmetic is needed.

### i18n — react-i18next

Phase 5 implementation, but one rule applies from Phase 4: **no hardcoded UI strings in
components**. All user-visible text uses `t('key')` from day one, even before locale files are
populated. Prevents a painful extraction refactor later.

### Toasts / Notifications — Sonner

shadcn/ui's recommended toast library. Single-call API (`toast.success(...)`, `toast.error(...)`),
stacking, accessible. Integrates with CSS vars from `packages/tokens`.

### Large Lists — TanStack Virtual

Essential for collection view (potentially thousands of cards). Without virtualisation, rendering
large card grids freezes the browser. TanStack Virtual integrates naturally with TanStack Query's
infinite queries.

### Tables — TanStack Table

Collection table view (sortable columns, filters, configurable density). Part of the TanStack
ecosystem — consistent API with Query and Virtual.

### Drag and Drop — @dnd-kit/core

Deck builder card reordering between sections. `@dnd-kit` is the modern replacement for abandoned
`react-beautiful-dnd`. Accessible, mobile-compatible, no dependency on the native HTML5 DnD API
(which has known mobile bugs).

### Error Boundaries — react-error-boundary

Minimal library wrapping React's error boundary API. Applied to critical zones (deck builder,
collection, card search) to prevent a single JS error from crashing the entire page.

### PDF Generation — PDFKit (in `apps/worker`)

Proxy card printing requires pixel-precise image placement, exact millimetre margins, cut lines as
vector strokes, explicit DPI, and multi-format paper support. Cards are images (Scryfall JPEG/PNG) —
no font rendering needed. PDFKit provides this level of control; `@react-pdf/renderer`'s flexbox
model abstracts away the precision required for print output.

PDFKit runs in `apps/worker` only — never in `apps/api` or `apps/web` (existing architectural rule,
CLAUDE.md).

---

## What We Explicitly Chose NOT to Add

| Candidate              | Reason not added                                                                  |
| ---------------------- | --------------------------------------------------------------------------------- |
| Next.js                | Pushes toward Server Actions / Route Handlers — erodes `apps/api` as sole backend |
| Redux / MobX           | Overkill — Zustand + TanStack Query covers all state needs                        |
| react-hotkeys-hook     | Replaced by tinykeys (chord support, smaller)                                     |
| Lodash / es-toolkit    | Native JS sufficient — added only on proven need                                  |
| Lottie / Lordicon      | Introduces second icon rendering system — visual inconsistency                    |
| @react-pdf/renderer    | Insufficient precision for proxy card print layout                                |
| Temporal API           | Still requires polyfill — Intl native is sufficient                               |
| Framer Motion (old)    | Superseded by Motion v12 (renamed, lighter)                                       |
| Storybook for apps/web | Storybook is for `packages/web-ui` and `packages/tokens` only                     |

---

## Trade-offs

**Benefits:**

- TanStack ecosystem coherence (Start, Query, Form, Table, Virtual) — shared mental model,
  consistent APIs, shared devtools
- shadcn/ui + Base UI gives full ownership of component code — no override battles
- Single icon system (Lucide) — no visual inconsistency from multiple icon libraries
- Zustand + TanStack Query separation is explicit and teachable
- Intl native for dates keeps the bundle lean and i18n-ready

**Costs:**

- TanStack Start is newer — fewer community examples than Next.js
- Custom animated SVG components require more upfront work than Lottie/Lordicon
- tinykeys requires learning the chord syntax
- No date-fns means no `format()` convenience — slightly more verbose formatting code

**Risks:**

- TanStack Form is less battle-tested than React Hook Form — may hit edge cases
  - **Mitigation:** Zod validation is library-agnostic; switching form libs later doesn't touch the
    schema layer
- @dnd-kit has a steeper API than react-beautiful-dnd
  - **Mitigation:** deck builder drag-and-drop is Phase 7 — time to learn the API

---

## Evolution History

### 2026-06-08: Initial decision

- Validated during Session B (Phase 4.0.5) — full conversational review of all frontend technical
  aspects
- Key reversals from initial assumptions: PDFKit over @react-pdf/renderer (precision), Zustand added
  (UI state crosses component boundaries), Base UI over Radix for shadcn/ui
- TanStack Virtual and Table added (missed in initial stack definition)
- @dnd-kit and react-error-boundary added as overlooked necessities

---

## References

- [ADR-0016: TanStack Start](./0016-tanstack-start.md)
- [ADR-0017: packages/tokens Architecture](./0017-packages-tokens-architecture.md)
- [ADR-0006: Testing Strategy — Storybook](./0006-testing-strategy-with-vitest.md)
- [shadcn/ui Base UI changelog](https://ui.shadcn.com/docs/changelog/2026-01-base-ui)
- [Base UI documentation](https://base-ui.com)
- [Motion library](https://motion.dev)
- [tinykeys](https://github.com/jamiebuilds/tinykeys)
- [PDFKit](https://pdfkit.org)
