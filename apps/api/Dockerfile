# ---- Base ----
FROM node:20-bullseye-slim AS base

# Install dependencies required by onnxruntime-node
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    libstdc++6 \
    libgcc-s1 \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN npm install -g pnpm

# --------------------------
# DEVELOPMENT
# --------------------------
FROM base AS dev
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/*/package.json ./packages/
COPY apps/api/package.json ./apps/api/

# Install API + Prisma deps
RUN pnpm install --filter api... --filter @skyler-ai/prisma...

# Copy full source
COPY apps/api ./apps/api
COPY packages ./packages

# Build Prisma first, then API
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
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/*/package.json ./packages/
COPY apps/api/package.json ./apps/api/

# Install deps for API + Prisma
RUN pnpm install --filter api... --filter @skyler-ai/prisma... --frozen-lockfile

# Copy full source
COPY apps/api ./apps/api
COPY packages ./packages

# Build Prisma first, then API
RUN pnpm --filter api build

FROM base AS prod
WORKDIR /app/apps/api
ENV NODE_ENV=production

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

EXPOSE 4000
CMD ["node", "dist/apps/api/src/server.js"]
