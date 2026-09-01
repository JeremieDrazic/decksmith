# Decksmith

Decksmith is a personal tool for building Magic: The Gathering decks and generating clean,
print-ready proxy sheets.

**[decksmith.jerem.io](https://decksmith.jerem.io)**

It is designed first for my own use: to experiment, iterate, and build decks seriously — with a
strong focus on correctness, structure, and long-term maintainability.  
If it's useful to others, even better.

## Links

The app itself requires an account. Everything below is public.

**Look at it**

|                                                           |                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------- |
| [Design system](https://decksmith.jerem.io/design-system) | Storybook — components, tokens, accessibility checks on every story |
| [API reference](https://decksmith.jerem.io/api/reference) | OpenAPI generated from Zod, rendered with Scalar                    |

**Read the thinking**

|                                                                        |                                                |
| ---------------------------------------------------------------------- | ---------------------------------------------- |
| [Documentation](https://decksmith.jerem.io/docs/)                      | VitePress site — the whole thing               |
| [Architecture decisions](https://decksmith.jerem.io/docs/adr/)         | ADRs, with the trade-offs written down         |
| [Feature specs](https://decksmith.jerem.io/docs/specs/)                | What each feature is meant to do               |
| [Roadmap](https://decksmith.jerem.io/docs/roadmap)                     | Phase by phase, with what is actually done     |
| [Project state](https://decksmith.jerem.io/docs/context/project-state) | What works today, what is broken, what is next |

**Running system**

|                                                                                                     |                                 |
| --------------------------------------------------------------------------------------------------- | ------------------------------- |
| [Health](https://decksmith.jerem.io/api/health) · [Version](https://decksmith.jerem.io/api/version) | Live endpoints                  |
| [Releases](https://github.com/JeremieDrazic/decksmith/releases)                                     | Automated with semantic-release |
| [Issues](https://github.com/JeremieDrazic/decksmith/issues)                                         | The working backlog             |

<!-- TODO: add a screenshot of a generated A4 3x3 proxy sheet here once packages/pdf ships. -->

---

## Status

Decksmith is under active development and **not yet usable for deckbuilding**.

What works today is the foundation: accounts, the card database, and the design system. The
deckbuilding and printing features described in the Vision are designed (database models and API
contracts are in place) but not implemented yet.

| Area                                             | State                     |
| ------------------------------------------------ | ------------------------- |
| Authentication (register, login, password reset) | Working                   |
| User profile and preferences                     | Working                   |
| Scryfall card sync (~34.5k cards, ~101k prints)  | Working                   |
| Design system and component library              | Working                   |
| Card search API                                  | In progress               |
| Deck creation and editing                        | Designed, not implemented |
| Decklist import (plain text)                     | Designed, not implemented |
| Proxy sheet generation (A4, 3×3)                 | Designed, not implemented |
| Print-ready PDF export (crop marks)              | Designed, not implemented |

APIs and internal structure may change as the project evolves.

---

## Vision

Most deckbuilders focus on collection management or online play.  
Decksmith focuses on **craft**:

- building decks deliberately
- iterating on ideas
- preparing clean proxy sheets ready for printing and cutting

The goal is not to replace existing tools, but to offer a **focused, well-engineered workflow** from
decklist to physical playtest.

Decksmith follows a few simple principles:

- **Separation of concerns**  
  UI, domain logic, data contracts, and infrastructure are clearly separated.
- **Explicit contracts**  
  All data exchanged between systems is validated and documented.
- **Print correctness over convenience**  
  Generated PDFs are deterministic and printer-friendly.
- **Built as a real product, even if it starts as a side project**

Later ideas, once the core works: deck versioning, tags and notes, public deck sharing, and a mobile
companion app.

---

## Getting Started

Requires **Node.js 22+** and **pnpm 11+**. A Supabase project (Postgres + Auth) and Docker are
needed for the full stack.

```bash
git clone git@github.com:JeremieDrazic/decksmith.git
cd decksmith
pnpm install

cp .env.example .env   # then fill in your Supabase credentials

pnpm db:generate       # generate the Prisma client
pnpm db:push           # apply the schema to your database

pnpm dev               # run everything
```

Useful subsets:

```bash
pnpm dev:web           # web app only
pnpm dev:backend       # Redis + API + worker
pnpm dev:storybook     # component library
pnpm worker:sync:once  # run the Scryfall card sync once
```

Checks:

```bash
pnpm test              # unit and integration tests
pnpm typecheck
pnpm lint
```

---

## Architecture

Decksmith is a **modular monorepo** (pnpm workspaces + Turborepo), split so that a web app, a future
mobile app, and background jobs can share the same domain logic and data contracts.

### Applications

| App              | Purpose                                                         |
| ---------------- | --------------------------------------------------------------- |
| `apps/web`       | React SPA for deck building and print preparation               |
| `apps/api`       | Fastify HTTP API — authentication, deck data, job orchestration |
| `apps/worker`    | Background worker — Scryfall sync, PDF generation               |
| `apps/docs`      | VitePress documentation site (ADR, specs)                       |
| `apps/storybook` | Component library workbench                                     |
| `apps/mobile`    | Expo app — placeholder, not started                             |

### Shared packages

Fifteen workspaces under `packages/`, the main ones being `schema` (Zod contracts for every API
payload), `web-ui` (the component library), `scryfall` (card ingestion and normalization), `db`
(Prisma schema and access), `domain` (pure MTG rules — mana costs, color identity), `services`
(server-side business logic), and `api-client` / `query` (typed client and TanStack Query hooks).

`packages/pdf` and `packages/native-ui` are reserved placeholders and contain no code yet.

Full details in [`apps/docs`](apps/docs).

---

## Tech Stack

### Frontend

- React + TypeScript
- Vite
- TanStack Router
- TanStack Query
- Tailwind CSS
- shadcn/ui

### Backend

- Node.js
- Fastify
- Prisma
- Supabase (Postgres, Auth, Storage)

### Tooling

- pnpm + Turborepo
- Zod (schemas and validation)
- Vitest / Playwright
- Storybook
- Spec-driven development (ADR + task specs)

---

## Development Philosophy

Decksmith is built incrementally, around a few habits:

- small, reviewable changes
- explicit architectural decisions (ADR)
- documentation written alongside code
- avoiding premature abstraction

This project is also an experiment in using AI as a **coding assistant**, not as a replacement for
design or judgment.

---

## License

[MIT](LICENSE) © Jérémie Drazic
