# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# ---- Dependencies ----
FROM base AS deps
COPY ../../package.json ../../pnpm-lock.yaml ./
COPY ../../packages/*/package.json ./packages/*/
COPY package.json ./apps/web/
RUN pnpm install --filter web... --frozen-lockfile

# ---- Build ----
FROM base AS build
COPY package.json pnpm-lock.yaml ./
COPY packages/*/package.json ./packages/*/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --filter web... --frozen-lockfile

COPY . .
RUN pnpm turbo run build --filter=web...


# ---- Runtime ----
FROM base AS runtime
ENV NODE_ENV=development
WORKDIR /app/apps/web
COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
EXPOSE 3000
CMD ["pnpm", "start"]
