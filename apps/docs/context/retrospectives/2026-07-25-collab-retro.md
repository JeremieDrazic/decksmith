# Collaboration Retrospective — 2026-07-25 (after session 25)

First retrospective on how we work together. Scope: learning quality, session process, code & docs
quality, Claude tooling. Method: factual review of project artifacts (ADRs, decisions-log, pitfalls,
git history, memory), a guided self-assessment of every backend/architecture concept introduced
since session 1, then convergence on a small set of testable experiments.

Next retrospective: **after Phase 3 (Scryfall) ships**, or ~10 sessions from now, whichever comes
first. Re-run the self-assessment below and compare line by line.

---

## What works (keep doing)

- **The error → pitfall → rule loop.** 30 documented pitfalls; mistakes become checked-in knowledge
  (e.g. the testing rule codified in CLAUDE.md after the session-17 untested-function bug).
- **decisions-log with rationale.** Every non-obvious decision has its WHY — a real learning asset
  and the reason the "layers / DTOs / boundaries" concepts scored ✅ below: they are re-read and
  re-applied constantly.
- **Cadence and hygiene.** 25 sessions, product deployed to production, 210 tests, branch + PR
  workflow consistently followed.

## Learning self-assessment (baseline)

Test used per concept: _"could I explain this to another dev without notes?"_ ✅ = can explain · 🟡
= fuzzy · ❌ = needs relearning.

### A. Auth & security

| #   | Concept                                                | Rating |
| --- | ------------------------------------------------------ | ------ |
| 1   | JWT vs sessions, access token contents                 | ✅     |
| 2   | httpOnly/Secure cookies + signing (XSS protection)     | ✅     |
| 3   | API-proxied auth — why never front → Supabase (ADR-14) | 🟡     |
| 4   | Refresh flow — access vs refresh, cookie clearing      | 🟡     |
| 5   | IDOR + `assertOwnership` (session-13 fix)              | 🟡     |
| 6   | RLS as defense-in-depth (ADR-22)                       | 🟡     |
| 7   | Rate limiting on auth endpoints                        | ✅     |
| 8   | Open redirect — `redirectTo` validation                | ✅     |

### B. Database

| #   | Concept                                                  | Rating |
| --- | -------------------------------------------------------- | ------ |
| 9   | Prisma schema → generated client → db:push vs migrations | 🟡     |
| 10  | Session vs transaction pooler (PgBouncer, port 5432)     | 🟡     |
| 11  | Cascades — Restrict vs Cascade, shared vs user-owned     | ✅     |
| 12  | Indexes — `@@index([userId])`                            | ✅     |
| 13  | `User.id` without `@default`; seed orphan profiles       | 🟡     |

### C. Backend architecture

| #   | Concept                                                 | Rating |
| --- | ------------------------------------------------------- | ------ |
| 14  | DTOs + mappers — Prisma never leaves the API            | ✅     |
| 15  | Service layer — ServiceError, exception mapper (ADR-24) | ❌     |
| 16  | Layers: routes = HTTP glue / services / domain          | ✅     |
| 17  | Zod at boundaries + Fastify type provider               | 🟡     |
| 18  | Stable error codes as API contract (ADR-25)             | ✅     |
| 19  | Fastify plugins & decorators (`app.authenticate`)       | ✅     |
| 20  | Why repository pattern & DI were rejected (trade-off)   | ❌     |

### D. Infra & deployment

| #   | Concept                                            | Rating |
| --- | -------------------------------------------------- | ------ |
| 21  | Docker multi-stage + `pnpm deploy --prod`          | 🟡     |
| 22  | Reverse proxy (Traefik), label-driven routing      | ✅     |
| 23  | TLS/ACME — wildcard cert, DNS-01 vs HTTP-01        | ❌     |
| 24  | CI/CD — GHCR, `:sha` vs `:latest` tags             | ❌     |
| 25  | Prod vs dev — NODE_ENV, Secure cookies, trustProxy | ❌     |
| 26  | CORS — what it blocks, same-origin in prod         | ✅     |

### E. SSR & advanced frontend

| #   | Concept                                             | Rating |
| --- | --------------------------------------------------- | ------ |
| 27  | Hydration mismatch (localStorage in useState init)  | ✅     |
| 28  | Cookies vs localStorage for SSR preferences         | ✅     |
| 29  | `beforeLoad` guard + SSR Cookie forwarding (ADR-23) | 🟡     |
| 30  | Server functions — where the code runs              | ✅     |
| 31  | FOUC/FOUT elimination via server-derived state      | ✅     |
| 32  | Package boundaries — web never imports db/domain    | ✅     |
| 33  | pnpm workspaces / catalog / turbo strict env        | ✅     |
| 34  | Export conditions (`source` vs `dist`)              | ✅     |

**Score: 19 ✅ · 10 🟡 · 5 ❌** — the gaps cluster, they are not random.

## Findings

1. **Velocity killed pedagogy on recent sessions.** All five ❌ come from sessions 18+ (service
   layer refactor in 18, deployment marathon in 22–24 — 7 PRs in one session). The
   explain-before-code contract mechanically diluted under shipping pressure. Refactors got less
   explanation than new features. Partly a deliberate choice (devops is a lower learning priority
   for Jérémie), but the service layer — the central backend pattern — got caught in the same wave.
2. **Early concepts decay without reactivation.** The auth/DB 🟡s (3–6, 9–13) were explained in
   sessions 5–17, understood at the time, then never exercised again. Understanding-on-the-day is
   not retention; nothing in the process re-surfaces old concepts.
3. **Reading ≠ writing.** The "Claude explains → Claude writes → Jérémie validates" pattern builds
   reading comprehension. What sticks best (layers, boundaries, SSR) is what Jérémie either uses
   daily or was built slowly file-by-file with discussion.
4. **Docs carry duplicated history.** project-state.md (~450 lines) mostly restates history already
   in decisions-log and PRs; all three context docs are imported every session.
5. **WORKFLOW.md drifted from reality.** Prescribed reviewer-agent chains are no longer exercised as
   written; broken paths (`apps/apps/docs/...`) went unnoticed — a sign the file isn't read.

## Experiments (measured at next retro)

### E1 — Pair-programming mode in high-learning zones

Zones decide **who types the code** — never the depth of explanation, which stays full everywhere
(sparring-partner contract: Jérémie needs the full picture to build the best product).

- **High-learning zones** (Jérémie writes, Claude designs/guides/reviews): `packages/domain`,
  `packages/services`, `packages/scryfall`, auth, DB schema.
- **Ship-first zones** (Claude writes, full explanations continue): devops, tooling/config,
  repetitive UI.

Phase 3 (Scryfall normalization — pure domain logic) is the proving ground. **Success criterion:**
concepts introduced in pair mode score ✅ at the next self-assessment.

### E2 — Prioritized consolidation backlog (the 15 flagged concepts)

- **P1 — dedicated time:** service layer (#15, #20). One 30-min from-scratch walkthrough in an
  upcoming session. The only item worth dedicated time — it is the backbone of the backend.
- **P2 — active recall, no scheduled time:** auth flow (#3, #4, #5, #6) and DB (#9, #10, #13, #17),
  plus #29. Next time we touch that code, Jérémie explains the existing behaviour first; Claude
  fills the gaps. Retrieval beats re-listening.
- **P3 — interview-angle summaries only:** infra (#21, #23, #24, #25). No dedicated time (lower
  interest); when the topic resurfaces, a 5-line "what a system-design interview would ask" summary
  instead of a course.

**Success criterion:** at next retro, P1 items are ✅ and no P2 item has degraded to ❌.

- **Added 2026-07-29 (P2) — build-arg vs BuildKit secret:** a build-arg is baked into the image
  layers (readable via `docker history`); on a **public** GHCR image that leaks the value, so a
  credential (the Sentry auth token) must go through `--mount=type=secret` (mounted only for the
  `RUN`, never persisted). The DSN is fine as a build-arg — it's public by design (ends up in the
  browser bundle). The distinction is "baked into a public image", not "front vs back". Next time we
  touch the Docker/CI build, Jérémie explains the difference first.

- **Added 2026-07-30 (P2) — oracle/print split vs Scryfall's flat `card_faces`:** Scryfall bundles a
  face's rules identity (name/cost/text = oracle) and its image (print-specific) together in
  `card_faces`. Our model splits oracle (`Card`) from print (`CardPrint`), so a face can't be copied
  wholesale — its oracle bits go to a `CardFace` table (linked to `Card`), its two images stay in
  the **single** `CardPrint.imageUris` JSON as `{front, back}` (a double-faced card is still ONE
  physical print = ONE `CardPrint` row; `CardPrint` has no link to `CardFace`). Jérémie's miss:
  thought the two face images landed in separate `CardPrint` rows linked to `CardFace`. Re-check
  when we build the `CardFace` migration/normalization.

### E3 — Retention check at session end

`session.end` gains a step: 2–3 questions on the concepts introduced during the session. Misses join
the consolidation backlog instead of evaporating silently. ~5 minutes. **Success criterion:** the
check actually runs (visible in session-end notes) and the next self-assessment shows no ❌ on
concepts introduced after this retro.

## One-off cleanups (this session)

1. **project-state.md → current state only.** Keep environment, what works _today_, blockers, and
   everything planned/future (steps remaining, open decisions). Drop per-session history — it lives
   in decisions-log, PRs, and git.
2. **WORKFLOW.md → describe the real process.** The 9 reviewer agents stay available (other sessions
   may use them) but chains become on-demand suggestions, not prescribed sequences; fix broken
   `apps/apps/docs/...` paths.

Process amendments land in `.claude/PROFILE.md` and `CLAUDE.md` (pair-mode zones, retention check).
