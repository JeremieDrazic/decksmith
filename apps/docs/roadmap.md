# Decksmith — Product Roadmap

Status: ✅ Done · 🔄 In progress · ⬜ Not started

---

## Phase 0: Infrastructure

- ✅ Monorepo scaffold (pnpm + Turborepo)
- ✅ CI pipeline (GitHub Actions — format, lint, typecheck, test)
- ✅ TypeScript strict mode
- ✅ Oxlint + Oxfmt (ADR-0013)
- ✅ Shared configs in `packages/config` (tsconfig, vitest)
- ✅ Prisma schema (16 models) in `packages/db`
- ✅ Zod schemas (all domains) in `packages/schema`
- ✅ Fastify server + Zod type provider in `apps/api`
- ✅ User CRUD routes (`/api/v1/users`)
- ✅ Database seed script with faker.js
- ✅ 13 ADRs + 10 feature specs
- ✅ Vitest infrastructure (shared config + sample test)
- ✅ `.env.example`

---

## Phase 1: Documentation & Context System

- ✅ Create `apps/docs/roadmap.md` (this file)
- ✅ Create `apps/docs/context/project-state.md`
- ✅ Create `apps/docs/context/decisions-log.md`
- ✅ Update `CLAUDE.md` with @import + learning contract + maintenance policy
- ✅ Create `apps/docs/skills-and-agents.md`
- ✅ Create `.claude/WORKFLOW.md`
- ✅ Create 5 skills: `session.start`, `session.end`, `roadmap.update`, `module.scaffold`,
  `spec.sync`
- ✅ Create 9 subagents: `api-reviewer`, `db-reviewer`, `domain-reviewer`, `frontend-reviewer`,
  `ui-reviewer`, `a11y-reviewer`, `test-writer`, `devops-reviewer`, `cto-advisor`
- ✅ Configure GitHub MCP

---

## Phase 2: Foundation

### 2.1 Environment & DB Connection

- ✅ Verify Supabase project + connection string
- ✅ Run `db:push` to sync Prisma schema to Supabase
- ✅ Run seed script against live DB

### 2.2 Auth (spec: `user-auth.md`)

- ⬜ Enable Supabase Auth + OAuth providers (Google, GitHub)
- ⬜ Auth plugin in `apps/api` (JWT verification middleware)
- ⬜ Auth routes: register, login, logout, refresh, reset-password
- ⬜ Zod schemas for auth DTOs in `packages/schema/src/auth/`
- ⬜ RLS policies for user-owned tables
- ⬜ Auto-create `UserPreferences` on signup

### 2.3 Rate Limiting & CORS

- ⬜ `@fastify/rate-limit` with strict limits on auth endpoints
- ⬜ `@fastify/cors` configured for dev + prod origins

---

## Phase 3: Scryfall Integration (spec: `card-search.md`)

### 3.1 packages/scryfall

- ⬜ Bulk data download client
- ⬜ Card normalization (Scryfall → `Card` + `CardPrint` Prisma models)
- ⬜ In-memory caching layer
- ⬜ Zod schemas for Scryfall API responses
- ⬜ Unit tests for normalization logic

### 3.2 Initial Data Sync (apps/worker)

- ⬜ BullMQ + Redis setup in `apps/worker`
- ⬜ `scryfall-sync` job + daily cron schedule
- ⬜ Incremental update handling

### 3.3 Card API

- ⬜ `GET /api/v1/cards/search` (full-text + filters: color, CMC, rarity, format)
- ⬜ `GET /api/v1/cards/:id` (card detail + prints)
- ⬜ Autocomplete endpoint (< 200ms)

---

## Phase 4: Web Frontend Foundation

### 4.1 apps/web Setup

- ⬜ Vite + React initialized
- ⬜ TanStack Router + TanStack Query
- ⬜ Tailwind + shadcn/ui
- ⬜ Base routes: `/`, `/login`, `/register`, `/dashboard`

### 4.2 packages/api-client

- ⬜ Typed fetch client wrapping all API endpoints
- ⬜ Error handling with typed error codes from `packages/schema`

### 4.3 packages/query

- ⬜ TanStack Query hooks: `useUser`, `useUserPreferences`, `useCardSearch`

### 4.4 Auth UI

- ⬜ Login + Register pages
- ⬜ Email confirmation + password reset flow
- ⬜ Auth guard for protected routes

### 4.5 packages/web-ui Foundation

- ⬜ shadcn/ui base components: Button, Input, Form, Card, Badge, Dialog, Toast
- ⬜ Design tokens from `packages/tokens` applied

---

## Phase 5: Collection Management (spec: `collection.md`)

### 5.1 Collection API

- ⬜ CRUD for collection entries + folders
- ⬜ Domain logic in `packages/domain`
- ⬜ Tags CRUD + attach/detach

### 5.2 Collection UI

- ⬜ Inventory page (grid/table/list views)
- ⬜ Add card flow (search → print → quantity/condition)
- ⬜ Saved views, folder nav, tag UI

---

## Phase 6: Deck Management (spec: `deck-management.md`)

### 6.1 Deck API

- ⬜ CRUD for decks + sections + cards
- ⬜ Format validation (singleton, color identity, banlists)
- ⬜ Collection coverage calculation
- ⬜ Deck statistics (mana curve, colors, avg CMC)
- ⬜ Public deck sharing

### 6.2 Deck UI

- ⬜ Deck list + creation flow
- ⬜ Deck builder (sections sidebar + card grid)
- ⬜ Format validation feedback, coverage indicator, stats panel
- ⬜ Public share page `/decks/:id` (no auth)

---

## Phase 7: Pricing (spec: `pricing.md`)

- ⬜ Extend Scryfall sync for prices (TCGplayer USD + Cardmarket EUR)
- ⬜ `GET /api/v1/collection/valuation`
- ⬜ `GET /api/v1/decks/:id/cost`
- ⬜ Pricing UI in collection view + deck builder

---

## Phase 8: PDF Generation (spec: `pdf-generation.md`)

### 8.1 packages/pdf

- ⬜ Deterministic PDF layout engine
- ⬜ Paper formats, grid config, margins, cut lines, DPI, double-sided
- ⬜ Unit tests for layout math

### 8.2 Worker Infrastructure

- ⬜ Redis (Docker for dev, Upstash for production)
- ⬜ BullMQ PDF job

### 8.3 PDF API + UI

- ⬜ `POST /api/v1/pdf` (enqueue) + GET status + GET download
- ⬜ Preview panel, config form, job status polling

---

## Phase 9: 3D Card Viewer (spec: `card-details.md`)

- ⬜ Three.js card component in `packages/web-ui`
- ⬜ Rotation, zoom, animated foil shader
- ⬜ Fallback for low-end devices

---

## Phase 10: Craft Guide (spec: `craft-guide.md`)

- ⬜ `CraftGuideArticle` seed data
- ⬜ `GET /api/v1/craft-guide` (list + single)
- ⬜ Article list + reader UI

---

## Phase 11: Recommendations

- ⬜ Recommendation engine in `packages/domain`
- ⬜ API routes + feedback endpoints
- ⬜ Recommendations panel in deck builder

---

## Phase 12: Documentation Site

- ✅ `apps/docs/` with VitePress (docs live here directly)
- ✅ GitHub Pages deployment via `.github/workflows/docs.yml`

---

## Phase 13: Mobile App (apps/mobile)

_Dependencies: Phase 5 + 6 stable on web_

### 13.1 Setup

- ⬜ Initialize Expo + React Native in `apps/mobile`
- ⬜ Configure `packages/native-ui` (React Native components)
- ⬜ Auth: Supabase Auth for React Native (`expo-auth-session`)
- ⬜ Navigation: Expo Router
- ⬜ Shared: `packages/api-client`, `packages/schema`, `packages/domain` (reused as-is)

### 13.2 Core Features

- ⬜ Auth flow (login, register, session)
- ⬜ Card search (camera barcode scan → card lookup)
- ⬜ Collection management (add/view/edit entries)
- ⬜ Deck list + view (read-only, edit later)
- ⬜ PDF generation trigger + download

### 13.3 Mobile-Specific

- ⬜ Push notifications (Expo Notifications) for price alerts, PDF ready
- ⬜ Offline mode for collection browsing
- ⬜ Camera integration for card scanning

---

## Evergreen

- ⬜ Write unit tests as each module is implemented
- ⬜ Update ROADMAP per session (`/roadmap.update`)
- ⬜ Update `apps/docs/context/project-state.md` per session (`/session.end`)
- ⬜ Check dependency updates at session start (`/session.start`)
- ⬜ Create ADRs for new architectural decisions
