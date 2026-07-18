# syntax=docker/dockerfile:1
# Build context: workspace root
#   docker build -f apps/api/Dockerfile -t decksmith-api .
#
# TEMPORARY — single-stage build pending Phase 2.5 (compiled dist/ pipeline).
# Phase 2.5 will replace this with a proper multi-stage build:
# builder compiles each package to dist/, runner copies only the compiled output.

FROM node:22-alpine

RUN corepack enable
WORKDIR /app

# pnpm-workspace.yaml uses globs (apps/*, packages/*) so only the directories
# that exist here are discovered as workspace members. Copying only the API's
# deps means pnpm install won't pull in web-ui, tokens, query, etc.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json             ./apps/api/
COPY packages/config/package.json      ./packages/config/
COPY packages/db/package.json          ./packages/db/
COPY packages/domain/package.json      ./packages/domain/
COPY packages/schema/package.json      ./packages/schema/
COPY packages/services/package.json    ./packages/services/
COPY packages/utils/package.json       ./packages/utils/

# --prod skips devDependencies. --frozen-lockfile ensures the lockfile is not
# updated (same versions as local dev). Source changes below won't bust this layer.
RUN pnpm install --frozen-lockfile

COPY apps/api/          ./apps/api/
COPY packages/config/   ./packages/config/
COPY packages/db/       ./packages/db/
COPY packages/domain/   ./packages/domain/
COPY packages/schema/   ./packages/schema/
COPY packages/services/ ./packages/services/
COPY packages/utils/    ./packages/utils/

# Generates the Prisma client from schema.prisma into node_modules/@prisma/client.
# No real DB connection is opened — DATABASE_URL is syntactically required by
# the Prisma v7 config loader even during generation.
RUN DATABASE_URL=postgresql://localhost:5432/dummy pnpm --filter @decksmith/db db:generate

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# pnpm creates per-package node_modules for workspace members, not root-level symlinks.
# Node resolves tsx and workspace deps correctly from the api package directory.
WORKDIR /app/apps/api
CMD ["node", "--import", "tsx/esm", "src/index.ts"]
