# syntax=docker/dockerfile:1
# Build context: workspace root
#   docker build -f apps/web/Dockerfile -t decksmith-web .

# ── builder ──────────────────────────────────────────────────────────────────
FROM node:22.23.1-alpine3.24 AS builder
RUN corepack enable
WORKDIR /app

# Layer: workspace manifests — invalidated only when deps change, not on source edits.
# @decksmith/web's dependency closure (verified from package.json graph).
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY apps/web/package.json            ./apps/web/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/config/package.json     ./packages/config/
COPY packages/domain/package.json     ./packages/domain/
COPY packages/i18n/package.json       ./packages/i18n/
COPY packages/query/package.json      ./packages/query/
COPY packages/schema/package.json     ./packages/schema/
COPY packages/test-utils/package.json ./packages/test-utils/
COPY packages/tokens/package.json     ./packages/tokens/
COPY packages/utils/package.json      ./packages/utils/
COPY packages/web-ui/package.json     ./packages/web-ui/

RUN pnpm install --frozen-lockfile

# Layer: source — invalidated on any source change.
COPY apps/web/            ./apps/web/
COPY packages/api-client/ ./packages/api-client/
COPY packages/config/     ./packages/config/
COPY packages/domain/     ./packages/domain/
COPY packages/i18n/       ./packages/i18n/
COPY packages/query/      ./packages/query/
COPY packages/schema/     ./packages/schema/
COPY packages/test-utils/ ./packages/test-utils/
COPY packages/tokens/     ./packages/tokens/
COPY packages/utils/      ./packages/utils/
COPY packages/web-ui/     ./packages/web-ui/

# Same-origin API in production: bake an EMPTY base URL so the browser bundle issues relative
# /api requests. The SSR server reads the API URL at runtime from process.env.API_URL instead.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
# Sentry/GlitchTip DSN, baked into the browser bundle (public by nature). Empty in dev/local builds.
ARG VITE_SENTRY_DSN=""
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
RUN pnpm turbo build --filter=...@decksmith/web

# Self-contained production node_modules alongside .output.
# nitro externalizes `react` without tracing it into .output (nitrojs/nitro#4171: Base UI's
# use-sync-external-store shim leaks a runtime require("react")). The server therefore needs a real
# node_modules with react next to .output. Same `pnpm deploy` technique as the API image.
# TODO: drop this and ship a bare .output once the upstream Vite/rolldown fix (or nitro's
# experimental cjsRequireRewrite flag, PR #4365) lands in a published release — see ADR-0027.
# No --no-optional here (that flag was Prisma-specific to the API image).
RUN pnpm deploy --filter @decksmith/web --prod --ignore-scripts --legacy /deploy

# ── runner ───────────────────────────────────────────────────────────────────
FROM node:22.23.1-alpine3.24 AS runner
WORKDIR /app
COPY --from=builder --chown=node:node /deploy .
COPY --from=builder --chown=node:node /app/apps/web/.output ./.output

ENV NODE_ENV=production
ENV PORT=3000
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:$PORT/" || exit 1

CMD ["node", ".output/server/index.mjs"]
