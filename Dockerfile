# --- Stage 1: Base ---
FROM node:24-alpine AS base
# OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl
# Pin npm so the npm that reads package-lock.json matches the one that wrote it; otherwise
# `npm ci` can reject the lock as out of sync. Keep this equal to `engines.npm` in package.json.
RUN npm install -g npm@11.17.0
WORKDIR /app

# --- Stage 2: Dependencies ---
FROM base AS dependencies
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# All dependencies, dev included — the build and the Prisma CLI need them
RUN npm ci
# prisma.config.ts reads DATABASE_URL on load; generate never connects, so a dummy is enough.
# Scoped to this RUN so the dummy never leaks into a runtime stage.
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npx prisma generate

# --- Stage 3: Development Runtime ---
FROM dependencies AS development
ENV NODE_ENV=development
COPY . .
CMD ["npm", "run", "dev"]

# --- Stage 4: Builder ---
FROM dependencies AS builder
COPY . .
RUN npm run build
# Keep only production dependencies for the runtime image
RUN npm prune --omit=dev

# --- Stage 5: Migration Runtime ---
# Runs `prisma migrate deploy` as a one-off job before the app rolls out
FROM dependencies AS migration
ENV NODE_ENV=production
CMD ["npx", "prisma", "migrate", "deploy"]

# --- Stage 6: Production Runtime ---
FROM base AS production
ENV NODE_ENV=production

RUN addgroup -g 10001 app \
    && adduser -D -u 10001 -G app app \
    && chown -R app:app /app

COPY --chown=app:app --from=builder /app/dist ./dist
COPY --chown=app:app --from=builder /app/node_modules ./node_modules
COPY --chown=app:app --from=builder /app/package.json ./package.json

USER app

# Environment variables come from the orchestrator (or `env_file` in compose), never baked in
CMD ["npm", "run", "start:prod"]
