# Multi-stage Dockerfile for Topology Architecture & Node Graph Microservice
FROM node:20-alpine AS builder
WORKDIR /usr/src/topology-service

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S topogroup && adduser -S topouser -G topogroup
USER topouser

COPY --from=builder /usr/src/topology-service/dist ./dist
COPY --from=builder /usr/src/topology-service/package*.json ./
RUN npm ci --only=production

EXPOSE 50053 8082
ENV PORT=8082
ENV GRPC_PORT=50053
ENV NEO4J_URI=bolt://neo4j-graph.internal:7687

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8082/health || exit 1

ENTRYPOINT ["node", "dist/server.js"]
