# ---- Base ----
FROM node:20-bookworm-slim AS base

# Update GPG keys and install dependencies
RUN apt-get update --allow-insecure-repositories \
    && apt-get install -y --no-install-recommends --allow-unauthenticated \
       ca-certificates \
       gnupg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Now do the normal update with proper GPG verification
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libc6 \
       libstdc++6 \
       libgcc-s1 \
       wget \
       ca-certificates \
       dnsutils \
       curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN npm install -g pnpm

# --------------------------
# DEVELOPMENT AND PRODUCTION
# --------------------------
FROM base AS dev-prod
WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/*/package.json ./packages/
COPY apps/api/package.json ./apps/api/

# Install only dependencies
RUN pnpm install --filter api... --frozen-lockfile

# Copy full source
COPY apps/api ./apps/api
COPY packages ./packages

RUN pnpm --filter api build:docker
COPY apps/api/dist/packages/prisma ./apps/api/dist/packages/prisma

WORKDIR /app/apps/api
ENV NODE_ENV=development
EXPOSE 4000
CMD ["node", "dist/apps/api/src/server.js"]