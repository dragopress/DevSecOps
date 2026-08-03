# Multi-stage Dockerfile for High-Performance Threat Detection & Sigma Translation Service
FROM rust:1.77-alpine AS builder
WORKDIR /usr/src/threat-detection

RUN apk add --no-cache musl-dev gcc protoc

COPY . .
RUN cargo build --release

FROM alpine:3.19 AS runner
WORKDIR /app

RUN addgroup -S threatsec && adduser -S sigmadetect -G threatsec
USER sigmadetect

COPY --from=builder /usr/src/threat-detection/target/release/threat-detection-service .
COPY --from=builder /usr/src/threat-detection/rules ./rules

EXPOSE 50052 8081
ENV PORT=8081
ENV GRPC_PORT=50052
ENV CLICKHOUSE_URL=http://clickhouse-logs.internal:8123

HEALTHCHECK --interval=10s --timeout=2s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8081/health || exit 1

ENTRYPOINT ["./threat-detection-service"]
