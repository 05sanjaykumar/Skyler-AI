# --- Base image ---
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# --- Dependencies ---
FROM base AS deps
COPY ../../pnpm-lock.yaml ../../package.json ../../pnpm-workspace.yaml ./
COPY ../../packages ./packages
COPY package.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY . .
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
WORKDIR /app/apps/web
RUN pnpm run build

# --- Production runtime ---
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/package.json ./
EXPOSE 3000
CMD ["pnpm", "start"]
