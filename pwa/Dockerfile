#syntax=docker/dockerfile:1

FROM node:lts AS base

WORKDIR /srv/app

ENV NEXT_TELEMETRY_DISABLED=1

# Enable pnpm via corepack (like the API Platform reference)
RUN corepack enable && corepack prepare pnpm@latest --activate

# ---------- DEVELOPMENT ----------
FROM base AS dev

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=localhost

CMD ["sh", "-c", "pnpm install && pnpm dev"]

# ---------- PRODUCTION ----------
FROM base AS prod

COPY --link pnpm-lock.yaml ./
RUN pnpm fetch --prod

COPY --link . .
RUN pnpm install --offline
RUN pnpm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
USER nextjs

CMD ["node", ".next/standalone/server.js"]
