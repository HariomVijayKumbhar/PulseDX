# ─── Stage 1: Build ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and compile TypeScript → dist/
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ─── Stage 2: Production runner ────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production-only dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Non-root user for security
USER node

EXPOSE 5000

# Health check — polls the API's /health endpoint every 30 s
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "dist/server.js"]
