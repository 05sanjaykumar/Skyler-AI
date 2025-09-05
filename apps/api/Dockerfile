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

# Copy api package.json
COPY apps/api/package.json ./apps/api/

# Install only api dependencies using pnpm workspace
RUN pnpm install --filter api... --frozen-lockfile

# ---- Build ----
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build api
RUN pnpm turbo run build --filter=api...

# ---- Runtime ----
FROM base AS runtime
WORKDIR /app/apps/api
ENV NODE_ENV=development

# Copy built api and dependencies
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

CMD ["node", "dist/server.js"]
