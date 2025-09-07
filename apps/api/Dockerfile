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
# DEVELOPMENT
# --------------------------
FROM base AS dev
WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/*/package.json ./packages/
COPY apps/api/package.json ./apps/api/

# Install only dependencies
RUN pnpm install --filter api... --filter @skyler-ai/prisma...

# Copy full source
COPY apps/api ./apps/api
COPY packages ./packages

# Build API
RUN pnpm --filter api build

WORKDIR /app/apps/api
ENV NODE_ENV=development
EXPOSE 4000
CMD ["node", "dist/apps/api/src/server.js"]

# --------------------------
# PRODUCTION
# --------------------------
FROM base AS build
WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/*/package.json ./packages/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --filter api... --filter @skyler-ai/prisma... --frozen-lockfile

# Copy full source
COPY apps/api ./apps/api
COPY packages ./packages

RUN pnpm --filter api build

# Final production image
FROM base AS prod
WORKDIR /app/apps/api
ENV NODE_ENV=production

# Copy build artifacts
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

EXPOSE 4000
CMD ["node", "dist/apps/api/src/server.js"]
