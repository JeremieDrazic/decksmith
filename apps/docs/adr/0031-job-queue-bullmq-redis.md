# ADR-0031 — Job Queue: BullMQ + Self-Hosted Redis

**Status:** Accepted **Date:** 2026-08-09

## Context

Phase 3.2 needs `apps/worker` to run `scryfall-sync`: download Scryfall's `default_cards` bulk dump
once a day and upsert it into `Card` / `CardPrint` / `CardFace` (ADR-0030 settled that the worker
writes via Prisma directly). This raises two infrastructure questions the roadmap flags as
"significant new dependencies" (CLAUDE.md → ADR required):

1. **How is background work scheduled and executed?** A single daily job today; user-triggered,
   concurrent, retryable jobs later (Phase 9 PDF generation).
2. **Where does the backing store (Redis) run**, in dev and in prod?

A **job queue** decouples _what needs doing_ from _who does it_: a producer enqueues work, one or
more workers pull and execute it, with retries, concurrency, and scheduling handled by the queue.
BullMQ is the Node implementation of that pattern; it stores queue state in **Redis** (an in-memory,
fast, shared data store).

## Decision

### 1. Adopt **BullMQ + Redis** now, not later

`apps/worker` uses **BullMQ** for all background jobs, backed by **Redis**. `scryfall-sync` is
registered as a **repeatable job** on a daily cron schedule.

This is deliberately introduced on a _simple, low-stakes_ job (one daily sync, no user in the loop)
even though a bare cron would technically suffice for it. Rationale below.

### 2. Incremental sync state lives in a **`SyncState` Postgres table**

Before downloading anything, `scryfall-sync` calls `getBulkDataInfo()` (cheap metadata) and compares
the dump's `updatedAt` against **the last dump it successfully processed**. Equal → stop (no 2 GB
download); newer → fetch + stream + upsert. That "last processed" bookkeeping is persisted in a
small Postgres table, keyed by sync source so future syncs (prices, rulings) reuse it:

```prisma
model SyncState {
  source            String    @id                          // "default_cards", later "prices"…
  status            String?                                 // "success" | "running" | "skipped" | "failed"
  lastDumpUpdatedAt DateTime? @map("last_dump_updated_at")  // Scryfall updatedAt of the last processed dump
  lastSyncedAt      DateTime? @map("last_synced_at")        // when a run last succeeded
  lastCardCount     Int?      @map("last_card_count")       // only set on a run that upserted
  lastError         String?   @map("last_error")            // failure message when status = "failed"

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@map("sync_state")
}
```

All tracking fields are nullable: on the very first run there is no history (`lastDumpUpdatedAt` is
`null` → treat the dump as new), and not every field is meaningful in every state (a `skipped` run
sets no `lastCardCount`; a `failed` run sets `lastError`, not `lastCardCount`). `status` gives the
context to interpret the nullables. `status` is a documented `String` (not a Prisma enum) to match
the house style (`layout`, `rarity` are also plain strings).

**Why Postgres, not Redis:** Redis is the _queue's_ infrastructure; sync bookkeeping is durable
reference data that belongs next to the cards it describes (already in Postgres) and benefits from
Prisma's transactional writes. Run non-overlap is BullMQ's job, not this table's — hence no lock
column.

### 3. Redis is **self-hosted**, in both environments — no managed provider

- **Dev:** a minimal `docker-compose.yml` at the repo root with a **single `redis` service**.
  Postgres stays on Supabase cloud (unchanged); only Redis is containerized locally. Start with
  `docker compose up -d redis`.
- **Prod:** a `redis` container added to `deploy/compose.yml` on the VPS, attached to the **internal
  Docker network only** — never routed through Traefik, never exposed to the internet. Persistence
  via a named volume + AOF (append-only file); password-protected (`requirepass`) as
  defense-in-depth.

The same Redis image and configuration run in dev and prod (parity).

**Upstash (managed Redis) is explicitly rejected** — see rationale. This revises the earlier roadmap
note ("Redis Docker for dev, Upstash for production", Phase 9.2), written before the VPS Docker
stack existed.

## Rationale

**Why BullMQ + Redis now, on a job that doesn't strictly need it:**

- **Phase 9 (PDF generation) needs a real queue, incompressibly** — users will trigger jobs
  concurrently, with status polling and retries. That is the canonical queue use case.
- **Introducing the infra now, cold, on a stakes-free job is the cheap time to learn and harden
  it.** When Phase 9 arrives under real user load, Redis + BullMQ will already be deployed and
  understood — we de-risk in advance instead of under pressure.
- The roadmap already commits to it (Phase 3.2, Phase 9.2).

The accepted cost: one more running service for a job that, today, a `setInterval` could handle.
Paid now, at rest, rather than later.

**Why self-hosted, not Upstash:**

- **BullMQ + per-command billing is a known trap.** A BullMQ worker holds a persistent connection
  and continuously polls the queue with blocking commands — a steady stream of Redis commands even
  when idle. On Upstash's pay-per-command model this burns a free-tier quota continuously. BullMQ
  also needs a native TCP Redis connection (`maxRetriesPerRequest: null` for blocking commands), not
  a REST endpoint.
- **We already run the Docker infrastructure** (Traefik + `deploy/compose.yml` on the VPS). Adding a
  Redis container is trivial and free, and sidesteps the billing/connection friction entirely.
- **Dev/prod parity:** the same Redis everywhere removes a class of "works locally, breaks in prod"
  bugs.

**Why internal-network-only in prod:** Redis has no business being reachable from the internet. Only
the worker (and later the API, for enqueuing) connects to it, over the internal Docker network. Not
exposing it through Traefik is the correct security posture; the password is a second layer.

## Trade-offs

**Benefits:**

- One queue system for all background work (sync now, PDF later) — no second mechanism to introduce.
- No external dependency, no per-command billing surprises, dev/prod parity.
- Resolves the long-standing "no local dev docker-compose" blocker, scoped to just Redis.

**Costs:**

- We own Redis's health (restart, disk for AOF). Minimal for a single `restart: unless-stopped`
  container.
- Slightly heavier local dev setup: contributors need Docker running for the worker (not for
  web/api, which stay native against Supabase).

**Risks:**

- **Redis data loss** (queue state) on crash. Low impact: `scryfall-sync` is idempotent and
  re-runnable; a lost daily job simply reruns next cron. AOF persistence covers most cases.
- **Version/beta drift:** BullMQ pins to a Redis major it supports — track compatibility on upgrade.

## Consequences / Follow-ups

- New dependencies: `bullmq` (+ its `ioredis` peer) in `apps/worker`. `apps/worker` gains a real
  `package.json` (currently a bare shell).
- New file: root `docker-compose.yml` (dev Redis) — resolves the roadmap "docker-compose.yml — local
  dev infra" item, scoped to Redis only.
- New env var: `REDIS_URL` (e.g. `redis://localhost:6379` in dev; internal service name in prod).
  Add to `.env.example`.
- **Deferred to a follow-up (not this session):** deploying the worker itself in prod as a 4th
  Docker image (api / web / statics / **worker**) added to the deploy pipeline and
  `deploy/compose.yml`, alongside the prod Redis container.
- The `SyncState` table (decision 2 above) is added to the Prisma schema via the normal
  schema-change flow (`db-reviewer` → `db:push`) — no separate ADR or decisions-log entry.

## References

- ADR-0030 — Worker Database Access (the worker writes reference data via Prisma; this ADR gives it
  a scheduler and a queue)
- ADR-0026 — Reverse proxy (Traefik) + `deploy/compose.yml` stack the prod Redis container joins
- Phase 3.2 (roadmap) — Scryfall initial data sync; Phase 9.2 — PDF worker (the real queue need)
- Phase 3.1 — `packages/scryfall` bulk client the sync job composes
