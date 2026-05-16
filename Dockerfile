# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm ci

COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm ci --omit=dev

# Copy compiled server and static client files
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/public ./client/public

# Persistent data directory (mount a volume here)
RUN mkdir -p /app/data

ENV PORT=8080
ENV DB_PATH=/app/data

EXPOSE 8080

CMD ["node", "server/dist/server.js"]
