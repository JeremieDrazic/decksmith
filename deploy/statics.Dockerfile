# Combined static site image: VitePress docs + Storybook, served by nginx.
#
# Artifacts are built in CI (pnpm is already set up there) BEFORE this image is built,
# then just copied in — no workspace build happens inside Docker. Each site lands in a
# subdirectory matching its public URL path, so Traefik forwards the path unchanged
# (no StripPrefix): /docs → .../docs, /design-system → .../design-system.
# Unprivileged nginx: runs as the non-root `nginx` user and listens on 8080 by default.
FROM nginxinc/nginx-unprivileged:1.30.4-alpine
COPY deploy/statics.nginx.conf       /etc/nginx/conf.d/default.conf
COPY apps/docs/.vitepress/dist       /usr/share/nginx/html/docs
COPY apps/storybook/storybook-static /usr/share/nginx/html/design-system
