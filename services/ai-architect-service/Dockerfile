# Multi-stage Dockerfile for AI Security Assistant & Gemini LLM Service
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S aisecgroup && adduser -S aisecuser -G aisecgroup
USER aisecuser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

EXPOSE 50056 8084
ENV PORT=8084
ENV GRPC_PORT=50056
ENV VECTOR_DB_URL=http://qdrant-vectors.internal:6333

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8084/health || exit 1

ENTRYPOINT ["node", "dist/server.js"]
