# Multi-stage Dockerfile for Isolated CI/CD Scanner Service
FROM golang:1.22-alpine AS builder
WORKDIR /app

RUN apk add --no-mkdir --no-cache git ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o cicd-scanner-service ./cmd/server

FROM alpine:3.19 AS runner
RUN apk add --no-cache ca-certificates git checkov
WORKDIR /app

# Non-root security user execution
RUN addgroup -S secops && adduser -S cicduser -G secops
USER cicduser

COPY --from=builder /app/cicd-scanner-service .
COPY --from=builder /app/schemas ./schemas

EXPOSE 50051 8080
ENV PORT=8080
ENV GRPC_PORT=50051
ENV DB_HOST=postgres-cicd.internal
ENV DB_PORT=5432

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

ENTRYPOINT ["./cicd-scanner-service"]
