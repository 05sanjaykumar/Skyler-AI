# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# --------------------------
# DEVELOPMENT AND PRODUCTION
# --------------------------
FROM base AS dev-prod
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/*/package.json ./packages/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --filter web... --frozen-lockfile

COPY apps/web ./apps/web
COPY packages ./packages

RUN pnpm --filter @skyler-ai/prisma add -D @types/node typescript

WORKDIR /app/apps/web
RUN pnpm turbo run build --filter=web...

# Set NODE_ENV to production but load your dev/test env file
ENV NODE_ENV=development

EXPOSE 3000
CMD ["pnpm", "start"]