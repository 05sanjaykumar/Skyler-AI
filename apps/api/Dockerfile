# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# ---- Dependencies ----
FROM base AS deps
COPY ../../package.json ../../pnpm-lock.yaml ./
COPY ../../packages/*/package.json ./packages/*/
COPY package.json ./apps/api/
RUN pnpm install --filter api... --frozen-lockfile

# ---- Build ----
FROM base AS build
COPY package.json pnpm-lock.yaml ./
COPY packages/*/package.json ./packages/*/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --filter api... --frozen-lockfile

COPY . .
RUN pnpm turbo run build --filter=api...

# ---- Runtime ----
FROM base AS runtime
ENV NODE_ENV=development
WORKDIR /app/apps/api
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
CMD ["node", "dist/server.js"]
