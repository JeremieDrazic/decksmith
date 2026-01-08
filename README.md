# Decksmith

Decksmith is a personal tool for building Magic: The Gathering decks and generating clean,
print-ready proxy sheets.

It is designed first for my own use: to experiment, iterate, and build decks seriously — with a
strong focus on correctness, structure, and long-term maintainability.  
If it’s useful to others, even better.

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

---

## Core Features

- Deck creation and editing (Commander first)
- Decklist import (plain text)
- Card search via Scryfall
- Proxy sheet generation (A4, 3×3 layout)
- Print-ready PDF export (crop marks, correct sizing)

Future features may include:

- deck versioning
- tags and notes
- public deck sharing
- mobile companion app

---

## Architecture Overview

Decksmith is built as a **modular monorepo**, designed to support:

- a web application
- a future mobile application
- background jobs (PDF generation)
- shared logic and contracts

### Applications

- **apps/web**  
  Web SPA (React) for deck building and print preparation

- **apps/mobile**  
  Mobile app (Expo) planned for later

- **apps/api**  
  HTTP API handling authentication, deck data, and job orchestration

- **apps/worker**  
  Background worker responsible for PDF generation and heavy tasks

### Shared Packages

- **packages/schema**  
  Zod schemas defining all API contracts (DTOs)

- **packages/domain**  
  Pure domain logic (deck parsing, rules, print planning)

- **packages/api-client**  
  Typed API client shared by web and mobile

- **packages/query**  
  Shared TanStack Query hooks and query keys

- **packages/db**  
  Prisma schema and database access (server-side only)

- **packages/scryfall**  
  Scryfall client, normalization, and caching strategy

- **packages/pdf**  
  Deterministic PDF generation engine (A4, layouts, crop marks)

- **packages/tokens**  
  Shared design tokens (spacing, radius, colors)

- **packages/web-ui**  
  Web UI components (shadcn + Tailwind)

- **packages/native-ui**  
  Mobile UI components (React Native)

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

Decksmith is built incrementally, with a strong emphasis on:

- small, reviewable changes
- explicit architectural decisions (ADR)
- documentation written alongside code
- avoiding premature abstraction

This project is also an experiment in using AI as a **coding assistant**, not as a replacement for
design or judgment.

---

## Status

Decksmith is under active development and not yet production-ready.  
APIs and internal structure may change as the project evolves.

---

## License

Personal project.  
License to be defined if the project is made public.
