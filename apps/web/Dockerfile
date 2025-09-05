# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# --------------------------
# DEVELOPMENT
# --------------------------
FROM base AS dev
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --filter web...

COPY apps/web ./apps/web
COPY packages ./packages

WORKDIR /app/apps/web
CMD ["pnpm", "dev"]

# --------------------------
# PRODUCTION
# --------------------------
FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --filter web... --frozen-lockfile

COPY apps/web ./apps/web
COPY packages ./packages

# Build Next.js
RUN pnpm turbo run build --filter=web...

FROM base AS prod
WORKDIR /app/apps/web
ENV NODE_ENV=production

COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

EXPOSE 3000
CMD ["pnpm", "start"]
