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
WORKDIR /app/apps/api
RUN pnpm run build

# --- Production runtime ---
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=build /app/apps/api/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/package.json ./
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/server.js"]
