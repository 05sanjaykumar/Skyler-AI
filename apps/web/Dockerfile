# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# ---- Dependencies ----
FROM base AS deps

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all packages package.json
COPY packages/*/package.json ./packages/

# Copy web package.json
COPY apps/web/package.json ./apps/web/

# Install only web dependencies using pnpm workspace
RUN pnpm install --filter web... --frozen-lockfile

# ---- Build ----
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build web
RUN pnpm turbo run build --filter=web...

# ---- Runtime ----
FROM base AS runtime
WORKDIR /app/apps/web
ENV NODE_ENV=development

# Copy built web and dependencies
COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

EXPOSE 3000
CMD ["pnpm", "start"]
