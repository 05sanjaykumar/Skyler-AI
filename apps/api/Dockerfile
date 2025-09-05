# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# ---- Dependencies ----
FROM base AS deps
# Copy lockfile and package.json from repo root
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy packages
COPY packages/*/package.json ./packages/*/
# Copy api package.json
COPY apps/api/package.json ./apps/api/
# Install dependencies for api only
RUN pnpm install --filter api... --frozen-lockfile

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
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
