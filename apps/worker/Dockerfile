# syntax=docker/dockerfile:1
# Build context: workspace root
#   docker build -f apps/worker/Dockerfile -t decksmith-worker .

# ── builder ──────────────────────────────────────────────────────────────────
FROM node:22.23.1-alpine3.24 AS builder
RUN corepack enable
WORKDIR /app

# Layer: workspace manifests — invalidated only when deps change, not on source edits.
# Only the worker's transitive workspace deps are copied:
#   worker → db, scryfall, utils   ·   scryfall → domain   ·   config (dev, tsconfig).
# packages/schema is intentionally absent: the worker never imports it.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY apps/worker/package.json        ./apps/worker/
COPY packages/config/package.json    ./packages/config/
COPY packages/db/package.json        ./packages/db/
COPY packages/domain/package.json    ./packages/domain/
COPY packages/scryfall/package.json  ./packages/scryfall/
COPY packages/utils/package.json     ./packages/utils/

# packages/db has a `postinstall: prisma generate` that runs during install — it needs the schema
# and prisma.config.ts. Copying them here (before install) keeps the Docker flow identical to a
# fresh `pnpm install` on a dev machine: the Prisma Client is generated into packages/db/src/generated.
# prisma.config.ts falls back to a placeholder DATABASE_URL, so generate needs no .env / secrets.
COPY packages/db/prisma/          ./packages/db/prisma/
COPY packages/db/prisma.config.ts ./packages/db/

RUN pnpm install --frozen-lockfile

# Layer: source — invalidated on any source change.
# The host's src/generated is excluded by .dockerignore; the client generated at install stays.
COPY apps/worker/       ./apps/worker/
COPY packages/config/   ./packages/config/
COPY packages/db/       ./packages/db/
COPY packages/domain/   ./packages/domain/
COPY packages/scryfall/ ./packages/scryfall/
COPY packages/utils/    ./packages/utils/

# Compile all packages in dependency order, ending with apps/worker.
# The generated Prisma Client (plain .ts under src/generated) is compiled to dist/ like any source —
# no engine binary, no asset-copy step (Prisma 7 uses a platform-independent WASM query compiler).
RUN pnpm turbo build --filter=...@decksmith/worker

# Create a self-contained production directory (see apps/api/Dockerfile for the flag rationale:
# --prod drops devDeps, --no-optional drops the Prisma CLI + studio, --legacy keeps the pre-v10
# virtual store layout, --ignore-scripts skips re-running packages/db's prisma-generate postinstall).
RUN pnpm deploy --filter @decksmith/worker --prod --no-optional --ignore-scripts --legacy /deploy

# ── runner ───────────────────────────────────────────────────────────────────
# Plain node:22-alpine — no corepack/pnpm at runtime, only `node`.
# The runner receives only /deploy: the pnpm global store stays in the builder stage.
# No EXPOSE / HEALTHCHECK: the worker is a headless BullMQ consumer, not an HTTP server.
FROM node:22.23.1-alpine3.24 AS runner
WORKDIR /app
COPY --from=builder --chown=node:node /deploy .

ENV NODE_ENV=production
USER node

CMD ["node", "dist/index.js"]
