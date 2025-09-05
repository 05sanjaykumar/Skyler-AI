# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# --------------------------
# DEVELOPMENT
# --------------------------
FROM base AS dev
WORKDIR /app
# Copy workspace files and api package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/*/package.json ./packages/
COPY apps/api/package.json ./apps/api/

# Install only API dependencies
RUN pnpm install --filter api...

# Copy full source
COPY apps/api ./apps/api
COPY packages ./packages

# Build TypeScript to dist
RUN pnpm turbo run build --filter=api...

# Set development environment but run from dist
WORKDIR /app/apps/api
ENV NODE_ENV=development
EXPOSE 4000
CMD ["node", "dist/server.js"]

# --------------------------
# PRODUCTION
# --------------------------
FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/*/package.json ./packages/
COPY apps/api/package.json ./apps/api/

# Install dependencies for build
RUN pnpm install --filter api... --frozen-lockfile

# Copy full source
COPY apps/api ./apps/api
COPY packages ./packages

# Build TypeScript to dist
RUN pnpm turbo run build --filter=api...

FROM base AS prod
WORKDIR /app/apps/api
ENV NODE_ENV=production

# Copy build artifacts and dependencies
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

# Expose API port
EXPOSE 4000
CMD ["node", "dist/server.js"]
