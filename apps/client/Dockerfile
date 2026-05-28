FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/client/package*.json ./apps/client/
COPY packages/types/package*.json ./packages/types/
RUN npm ci --workspace=apps/client --workspace=packages/types

FROM deps AS builder
COPY packages/types ./packages/types
COPY apps/client ./apps/client
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build --workspace=packages/types
RUN npm run build --workspace=apps/client

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
