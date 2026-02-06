# ADR-0012: Prisma Database Package Configuration

**Last Updated:** 2026-02-06 **Status:** Active **Context:** Decksmith

---

## Context

Decksmith needs type-safe database access for its PostgreSQL database hosted on Supabase. The
`packages/db` package must provide:

- A Prisma schema defining all database models
- A type-safe client for querying the database
- A migration workflow for versioned schema changes
- Integration with the monorepo's shared environment configuration

Prisma 7 introduced breaking changes from v6, notably removing the `url` field from the `datasource`
block in `schema.prisma` in favor of a new `prisma.config.ts` configuration file.

## Current Decision

### Prisma 7 Configuration Pattern

We use Prisma 7's `prisma.config.ts` for datasource configuration instead of inline `url` in
`schema.prisma`:

**`prisma/schema.prisma`** — no URL:

```prisma
datasource db {
  provider = "postgresql"
}
```

**`prisma.config.ts`** — URL loaded from environment:

```typescript
import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

config({ path: path.resolve(import.meta.dirname, '../../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
```

### Singleton Client Pattern

We use a singleton pattern with optional typing to prevent multiple connection pools:

```typescript
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

Key details:

- `prisma?` (optional) is more type-honest than a non-optional assertion — at first call,
  `globalThis.prisma` is `undefined`
- `??` (nullish coalescing) instead of `||` — only checks for `null`/`undefined`, not other falsy
  values
- `process.env['NODE_ENV']` — bracket notation required by TypeScript strict mode
  (`noPropertyAccessFromIndexSignature`)

### Global Environment File

A single `.env` file at the monorepo root contains `DATABASE_URL`. The `prisma.config.ts` loads it
via `dotenv` with a relative path to the root. This avoids duplicating `.env` files per package.

### Migration Workflow

| Command             | Purpose                                    | When to use          |
| ------------------- | ------------------------------------------ | -------------------- |
| `db:push`           | Sync schema to database without history    | Early prototyping    |
| `db:migrate:dev`    | Create versioned migration files           | Development          |
| `db:migrate:deploy` | Apply migrations without creating new ones | Production           |
| `db:generate`       | Generate TypeScript client from schema     | After schema changes |

Rule: Once the first migration is created, always use `db:migrate:dev` for schema changes.

### Generated Client in CI

The Prisma client is generated (lives in `node_modules/.prisma/client/`), not committed. CI must run
`prisma generate` before lint and typecheck. Since `generate` only reads the schema and does not
connect to the database, a dummy `DATABASE_URL` is sufficient:

```yaml
- name: Generate Prisma client
  run: pnpm --filter @decksmith/db db:generate
  env:
    DATABASE_URL: 'postgresql://localhost:5432/dummy'
```

## Rationale

### Why Prisma 7 Config Pattern

- **Separation of concerns**: Schema defines structure, config handles runtime environment
- **Security**: No hardcoded URLs in schema files that could be accidentally committed
- **Flexibility**: Config file can load environment variables from any source

### Why Singleton Pattern

- **Hot reload safety**: In development, module re-evaluation would create new `PrismaClient`
  instances, each opening a new connection pool
- **Serverless safety**: In serverless environments, warm containers reuse the global instance
  instead of creating new connections per invocation
- **Production skip**: In production, the global assignment is skipped — each process gets exactly
  one client instance without the overhead of checking `globalThis`

### Why Global .env

- **Single source of truth**: One file for all packages, no drift between configurations
- **Monorepo convention**: Root `.env` is already in `.gitignore`, no additional configuration
  needed
- **Simplicity**: `dotenv` resolves path relative to monorepo root via `import.meta.dirname`

### Why dotenv in pnpm Catalog

`dotenv` is added to the pnpm catalog because multiple packages will need environment variable
loading (e.g., `apps/api`, `apps/worker`). Centralizing the version avoids drift.

## Trade-offs

**Benefits:**

- Type-safe database access with auto-generated TypeScript types
- Versioned migrations committed alongside code
- Single environment configuration for the entire monorepo
- CI-safe with dummy URL for type generation

**Costs:**

- `prisma generate` must run before lint/typecheck (extra CI step)
- `dotenv` dependency for config loading
- Singleton pattern requires understanding of `globalThis` and type assertions

**Risks:**

- Prisma 7 is relatively new — some ecosystem tools may not yet support the config pattern
  - **Mitigation**: Pin to `^7.3.0`, monitor Prisma releases
- Generated client not committed — developer must run `db:generate` after cloning
  - **Mitigation**: Document in onboarding, add to `pnpm install` postinstall if needed

## Evolution History

### 2026-02-06: Initial decision

- Adopted Prisma 7 with `prisma.config.ts` pattern
- Implemented singleton client with optional typing and nullish coalescing
- Established global `.env` at monorepo root loaded via dotenv
- Defined migration workflow: push for prototyping, migrate for versioning
- Added `prisma generate` step to CI workflow with dummy DATABASE_URL

## References

- [Prisma 7 Configuration](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Prisma Client Singleton](https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)
- Related ADR: ADR-0002 (Monorepo structure, pnpm catalog for dotenv)
- Related ADR: ADR-0005 (Package boundaries — Prisma models never leave packages/db)
