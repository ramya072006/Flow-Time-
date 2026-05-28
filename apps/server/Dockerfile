FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/types/package*.json ./packages/types/
RUN npm ci --workspace=apps/server --workspace=packages/types

# Build
FROM deps AS builder
COPY packages/types ./packages/types
COPY apps/server ./apps/server
RUN npm run build --workspace=packages/types
RUN npm run build --workspace=apps/server

# Production
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 5000
CMD ["node", "dist/index.js"]
