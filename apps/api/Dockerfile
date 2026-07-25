# syntax=docker/dockerfile:1
# Build context: workspace root
#   docker build -f apps/api/Dockerfile -t decksmith-api .

# ── builder ──────────────────────────────────────────────────────────────────
FROM node:22.23.1-alpine3.24 AS builder
RUN corepack enable
WORKDIR /app

# Layer: workspace manifests — invalidated only when deps change, not on source edits.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY apps/api/package.json             ./apps/api/
COPY packages/config/package.json      ./packages/config/
COPY packages/db/package.json          ./packages/db/
COPY packages/domain/package.json      ./packages/domain/
COPY packages/schema/package.json      ./packages/schema/
COPY packages/services/package.json    ./packages/services/
COPY packages/utils/package.json       ./packages/utils/

# packages/db has a `postinstall: prisma generate` that runs during install — it needs the schema
# and prisma.config.ts. Copying them here (before install) keeps the Docker flow identical to a
# fresh `pnpm install` on a dev machine: the Prisma Client is generated into packages/db/src/generated.
# prisma.config.ts falls back to a placeholder DATABASE_URL, so generate needs no .env / secrets.
COPY packages/db/prisma/          ./packages/db/prisma/
COPY packages/db/prisma.config.ts ./packages/db/

RUN pnpm install --frozen-lockfile

# Layer: source — invalidated on any source change.
# The host's src/generated is excluded by .dockerignore; the client generated at install stays.
COPY apps/api/          ./apps/api/
COPY packages/config/   ./packages/config/
COPY packages/db/       ./packages/db/
COPY packages/domain/   ./packages/domain/
COPY packages/schema/   ./packages/schema/
COPY packages/services/ ./packages/services/
COPY packages/utils/    ./packages/utils/

# Compile all packages in dependency order, ending with apps/api.
# The generated Prisma Client (plain .ts under src/generated) is compiled to dist/ like any source —
# no engine binary, no asset-copy step (Prisma 7 uses a platform-independent WASM query compiler).
RUN pnpm turbo build --filter=...@decksmith/api

# Create a self-contained production directory.
# --prod          drops devDependencies (the prisma CLI, tsx, typescript…).
# --no-optional   drops optionalDependencies. @prisma/client declares the prisma CLI as an OPTIONAL
#                 peer, which pnpm records as an optionalDependency of the resolved client — without
#                 this flag pnpm ships the CLI + @prisma/dev + pglite + studio-core (~240MB) that the
#                 runtime never imports. The real client runtime (@prisma/client-runtime-utils) is a
#                 regular dependency and is kept.
# --legacy        pnpm v10+ requires inject-workspace-packages=true otherwise; --legacy keeps the
#                 pre-v10 behaviour (virtual store in /deploy/node_modules/.pnpm/).
# --ignore-scripts deploy is packaging, not building: the Prisma Client is already compiled into
#                 packages/db/dist. Without this, pnpm re-runs packages/db's `postinstall` (prisma
#                 generate) in a --prod tree where the prisma CLI was dropped, and fails.
RUN pnpm deploy --filter @decksmith/api --prod --no-optional --ignore-scripts --legacy /deploy

# ── runner ───────────────────────────────────────────────────────────────────
# Plain node:22-alpine — no corepack/pnpm at runtime, only `node`.
# The runner receives only /deploy: the pnpm global store stays in the builder stage.
FROM node:22.23.1-alpine3.24 AS runner
WORKDIR /app
COPY --from=builder --chown=node:node /deploy .

ENV NODE_ENV=production
ENV PORT=3000
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:$PORT/api/health" || exit 1

CMD ["node", "dist/index.js"]
