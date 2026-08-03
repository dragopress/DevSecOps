import { IsolatedServiceModule } from "../types";

export const isolatedServicesList: IsolatedServiceModule[] = [
  {
    id: "cicd-scanner",
    name: "CI/CD Scanner & IaC Audit Service",
    repositoryName: "secops-cicd-scanner-service",
    description: "Isolated service executing gitleaks secret detection, Checkov IaC policy benchmarking, and OPA policy evaluation.",
    port: 50051,
    techStack: ["Go 1.22", "gRPC / Protobuf", "GraphQL", "PostgreSQL", "Checkov", "OPA"],
    dockerfile: `# Multi-stage Dockerfile for Isolated CI/CD Scanner Service
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

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

ENTRYPOINT ["./cicd-scanner-service"]`,
    grpcProto: `syntax = "proto3";

package devsecops.cicd.v1;

option go_package = "github.com/secops/cicd-scanner-service/gen/v1;cicdv1";

import "google/protobuf/timestamp.proto";

service CiCdScannerService {
  rpc TriggerPipelineScan (TriggerScanRequest) returns (TriggerScanResponse);
  rpc GetPipelineStatus (GetStatusRequest) returns (GetStatusResponse);
  rpc StreamPipelineLogs (StreamLogsRequest) returns (stream PipelineLogChunk);
  rpc GetCheckovFindings (CheckovRequest) returns (CheckovResponse);
}

message TriggerScanRequest {
  string repository_url = 1;
  string commit_sha = 2;
  string branch = 3;
  string triggered_by = 4;
}

message TriggerScanResponse {
  string pipeline_run_id = 1;
  string status = 2;
  google.protobuf.Timestamp started_at = 3;
}

message CheckovRequest {
  string pipeline_run_id = 1;
  string severity_filter = 2;
}

message CheckovResponse {
  string pipeline_run_id = 1;
  int32 passed_checks = 2;
  int32 failed_checks = 3;
  repeated CheckovFinding findings = 4;
}

message CheckovFinding {
  string check_id = 1;
  string check_name = 2;
  string severity = 3;
  string resource = 4;
  string file_path = 5;
  string status = 6;
  string guidance = 7;
}`,
    graphqlSchema: `type Query {
  pipelineRun(id: ID!): PipelineRun
  checkovFindings(pipelineId: ID!, severity: CheckovSeverity): [CheckovFinding!]!
}

type Mutation {
  triggerScan(input: TriggerScanInput!): PipelineRun!
}

type Subscription {
  pipelineStatusChanged(pipelineId: ID!): PipelineRun!
  pipelineLogStream(pipelineId: ID!): PipelineLogEntry!
}

input TriggerScanInput {
  repoUrl: String!
  commitSha: String!
  branch: String
}

enum CheckovSeverity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

type PipelineRun {
  id: ID!
  commitSha: String!
  branch: String!
  status: String!
  startedAt: String!
  stages: [PipelineStage!]!
}

type PipelineStage {
  id: ID!
  name: String!
  status: String!
  durationMs: Int!
}

type CheckovFinding {
  checkId: String!
  checkName: String!
  severity: CheckovSeverity!
  resource: String!
  filePath: String!
  status: String!
  guidance: String!
}`,
    databaseInfo: {
      type: "PostgreSQL 16 (Dedicated Relational)",
      databaseName: "cicd_pipeline_db",
      connectionStringExample: "postgresql://cicd_user:SecOpsPass123!@postgres-cicd.internal:5432/cicd_pipeline_db?sslmode=require",
      connectionCode: `import { Pool } from "pg";

export const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://cicd_user:***@postgres-cicd.internal:5432/cicd_pipeline_db",
  max: 20,
  idleTimeoutMillis: 30000,
});`,
      tables: [
        "cicd_pipeline_runs",
        "cicd_stage_executions",
        "checkov_scan_findings",
        "pipeline_log_telemetry"
      ]
    },
    entrypointCode: `// Go gRPC & REST Service Entrypoint
package main

import (
	"log"
	"net"
	"google.golang.org/grpc"
	cicdv1 "github.com/secops/cicd-scanner-service/gen/v1"
)

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	grpcServer := grpc.NewServer()
	log.Println("CI/CD Scanner Service running on port 50051...")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}`
  },
  {
    id: "threat-detection",
    name: "Threat Detection & Sigma Rule Engine Service",
    repositoryName: "secops-threat-detection-service",
    description: "High-throughput Rust/Go microservice for parsing Sigma YAML rules, compiling multi-SIEM queries, and streaming log evaluation.",
    port: 50052,
    techStack: ["Rust", "ClickHouse", "gRPC / Protobuf", "GraphQL", "Sigma YAML Engine"],
    dockerfile: `# Multi-stage Dockerfile for High-Performance Threat Detection Service
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

EXPOSE 50052 8081
ENV PORT=8081
ENV GRPC_PORT=50052
ENV CLICKHOUSE_URL=http://clickhouse-logs.internal:8123

HEALTHCHECK --interval=10s --timeout=2s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:8081/health || exit 1

ENTRYPOINT ["./threat-detection-service"]`,
    grpcProto: `syntax = "proto3";

package devsecops.threatdetection.v1;

option go_package = "github.com/secops/threat-detection-service/gen/v1;threatv1";

service ThreatDetectionService {
  rpc ValidateSigmaRule (ValidateRuleRequest) returns (ValidateRuleResponse);
  rpc TranslateRuleToSIEM (TranslateRequest) returns (TranslateResponse);
  rpc IngestSecurityLogStream (stream SecurityLogEvent) returns (IngestSummary);
}

message ValidateRuleRequest {
  string sigma_yaml = 1;
}

message ValidateRuleResponse {
  bool is_valid = 1;
  string rule_id = 2;
  repeated string validation_errors = 3;
}

message TranslateRequest {
  string sigma_yaml = 1;
  string target_siem = 2; // "splunk_spl", "elastic_lucene", "aws_athena", "sentinel_kql"
}

message TranslateResponse {
  string target_siem = 1;
  string generated_query = 2;
}`,
    graphqlSchema: `type Query {
  sigmaRules(level: String, logsource: String): [SigmaRule!]!
  translateRule(sigmaYaml: String!, targetSiem: SiemTarget!): SiemTranslation!
}

type Mutation {
  validateSigmaYaml(yamlContent: String!): ValidationResult!
}

type Subscription {
  liveLogIngestionStream: SecurityLogEvent!
  threatAlertTriggered: ThreatAlert!
}

enum SiemTarget {
  SPLUNK_SPL
  ELASTIC_LUCENE
  AWS_ATHENA
  SENTINEL_KQL
}`,
    databaseInfo: {
      type: "ClickHouse (Dedicated Columnar DB)",
      databaseName: "secops_threat_db",
      connectionStringExample: "http://secops_analyst:ClickHouseSecOps2026!@clickhouse-logs.internal:8123/secops_threat_db",
      connectionCode: `import { createClient } from "@clickhouse/client";

export const clickhouseClient = createClient({
  url: "http://clickhouse-logs.internal:8123",
  database: "secops_threat_db",
});`,
      tables: [
        "security_logs_stream (MergeTree)",
        "sigma_rules_catalog (ReplacingMergeTree)",
        "matched_alerts_archive (SummingMergeTree)"
      ]
    },
    entrypointCode: `// Rust Axon / Tonic gRPC Entrypoint
use tonic::{transport::Server, Request, Response, Status};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "0.0.0.0:50052".parse()?;
    println!("Threat Detection Service listening on {}", addr);
    Server::builder().add_service(ThreatServiceServer::new(service)).serve(addr).await?;
    Ok(())
}`
  },
  {
    id: "topology-architecture",
    name: "Topology & Cloud Architecture Graph Service",
    repositoryName: "secops-topology-architecture-service",
    description: "Graph database microservice computing node connections, flow latency, encrypted transit status, and dynamic topology.",
    port: 50053,
    techStack: ["Node.js / TypeScript", "Neo4j / Amazon Neptune", "gRPC / Protobuf", "GraphQL", "D3 Graph Layout"],
    dockerfile: `# Multi-stage Dockerfile for Topology Architecture & Node Graph Microservice
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

EXPOSE 50053 8082
ENV PORT=8082
ENV GRPC_PORT=50053
ENV NEO4J_URI=bolt://neo4j-graph.internal:7687

ENTRYPOINT ["node", "dist/server.js"]`,
    grpcProto: `syntax = "proto3";

package devsecops.topology.v1;

service TopologyService {
  rpc GetArchitectureNodes (GetNodesRequest) returns (GetNodesResponse);
  rpc UpdateNodeStatus (UpdateNodeStatusRequest) returns (UpdateNodeStatusResponse);
}

message GetNodesRequest {
  string environment = 1;
}

message GetNodesResponse {
  repeated TopologyNode nodes = 1;
  int32 total_active_eps = 2;
}

message TopologyNode {
  string id = 1;
  string name = 2;
  string status = 3;
  repeated string connected_to = 4;
}`,
    graphqlSchema: `type Query {
  architectureNodes(provider: String): [TopologyNode!]!
  topologyHealthOverview: TopologyHealthSummary!
}

type Mutation {
  setNodeStatus(nodeId: ID!, status: NodeStatus!): TopologyNode!
}

enum NodeStatus {
  HEALTHY
  WARNING
  DEGRADED
}`,
    databaseInfo: {
      type: "Neo4j / Amazon Neptune (Graph Database)",
      databaseName: "secops_topology_graph",
      connectionStringExample: "bolt://neo4j:SecOpsGraph2026!@neo4j-graph.internal:7687",
      connectionCode: `import neo4j from "neo4j-driver";

export const neo4jDriver = neo4j.driver(
  "bolt://neo4j-graph.internal:7687",
  neo4j.auth.basic("neo4j", "SecOpsGraph2026!")
);`,
      tables: [
        "Nodes (:ArchitectureNode)",
        "Relationships (:INGESTS_FROM, :PROCESSED_BY, :STORES_IN)",
        "Indexes (Node.id, Node.provider)"
      ]
    },
    entrypointCode: `import { createServer } from "http";
console.log("Topology Architecture Service starting on port 50053...");`
  },
  {
    id: "data-lake",
    name: "Data Lake & S3 Iceberg Catalog Service",
    repositoryName: "secops-datalake-s3-service",
    description: "Dedicated Python/PyIceberg microservice executing S3 object lifecycle transitions, Glacier compaction, and Athena SQL log queries.",
    port: 50054,
    techStack: ["Python 3.11", "PyIceberg", "AWS Glue Catalog", "Apache Parquet", "gRPC / Protobuf", "GraphQL"],
    dockerfile: `# Multi-stage Dockerfile for Data Lake & S3 Iceberg Catalog Microservice
FROM python:3.11-slim AS builder
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.11-slim AS runner
WORKDIR /app

COPY --from=builder /install /usr/local
COPY . .

EXPOSE 50054 8083
ENV PORT=8083
ENV GRPC_PORT=50054
ENV GLUE_CATALOG_ID=aws-secops-iceberg-catalog

ENTRYPOINT ["python", "-m", "src.main"]`,
    grpcProto: `syntax = "proto3";

package devsecops.datalake.v1;

service DataLakeS3Service {
  rpc GetIcebergTables (GetTablesRequest) returns (GetTablesResponse);
  rpc ExecuteAthenaQuery (AthenaQueryRequest) returns (AthenaQueryResponse);
}

message GetTablesRequest {
  string database_name = 1;
}

message GetTablesResponse {
  repeated IcebergTableMeta tables = 1;
}

message IcebergTableMeta {
  string table_name = 1;
  int64 record_count = 2;
  double size_gb = 3;
}

message AthenaQueryRequest {
  string sql_query = 1;
}

message AthenaQueryResponse {
  string query_execution_id = 1;
  int32 execution_time_ms = 2;
  repeated string column_names = 3;
}`,
    graphqlSchema: `type Query {
  icebergTables(database: String): [IcebergTable!]!
  executeSql(query: String!): SqlQueryResult!
}

type Mutation {
  updateLifecyclePolicy(transitionDays: Int!, expirationDays: Int!): S3LifecycleConfig!
}`,
    databaseInfo: {
      type: "AWS Glue Catalog + Apache Iceberg (S3 Parquet)",
      databaseName: "secops_iceberg_db",
      connectionStringExample: "aws-glue://aws-secops-iceberg-catalog.us-east-1.amazonaws.com/secops_iceberg_db",
      connectionCode: `# PyIceberg Catalog Loader
from pyiceberg.catalog import load_catalog

catalog = load_catalog(
    "secops_glue",
    **{"type": "glue", "s3.endpoint": "https://s3.us-east-1.amazonaws.com"}
)`,
      tables: [
        "secops_iceberg_db.cloudtrail_events_v2",
        "secops_iceberg_db.vpc_flow_logs_parquet",
        "secops_iceberg_db.zeek_dns_iceberg"
      ]
    },
    entrypointCode: `# Python gRPC Server Entrypoint
import concurrent.futures
import grpc

def serve():
    server = grpc.server(concurrent.futures.ThreadPoolExecutor(max_workers=10))
    server.add_insecure_port('[::]:50054')
    server.start()
    server.wait_for_termination()`
  },
  {
    id: "policy-compliance",
    name: "Policy Engine & CIS Compliance Service",
    repositoryName: "secops-policy-compliance-service",
    description: "Isolated Open Policy Agent (OPA) server running Rego rules against CIS AWS Foundations benchmarks.",
    port: 50055,
    techStack: ["OPA (Open Policy Agent)", "Rego", "Go", "PostgreSQL", "gRPC / Protobuf"],
    dockerfile: `# Multi-stage Dockerfile for Open Policy Agent (OPA) & Compliance Microservice
FROM openpolicyagent/opa:0.62.0-static AS opa-bin

FROM alpine:3.19 AS runner
WORKDIR /app

COPY --from=opa-bin /opa /usr/local/bin/opa

COPY ./policies /app/policies

EXPOSE 8181 50055
ENV OPA_PORT=8181

ENTRYPOINT ["opa", "run", "--server", "--addr=0.0.0.0:8181", "/app/policies"]`,
    grpcProto: `syntax = "proto3";

package devsecops.compliance.v1;

service PolicyComplianceService {
  rpc EvaluateRegoPolicy (EvaluatePolicyRequest) returns (EvaluatePolicyResponse);
  rpc RunCisBenchmarkScan (CisBenchmarkRequest) returns (CisBenchmarkResponse);
}

message EvaluatePolicyRequest {
  string policy_rego = 1;
  string input_json = 2;
}

message EvaluatePolicyResponse {
  bool allow = 1;
  repeated string violations = 2;
}`,
    graphqlSchema: `type Query {
  cisBenchmarkReport(provider: String!): CisReport!
  evaluateRego(rego: String!, input: JSON!): OpaEvaluation!
}

type OpaEvaluation {
  allow: Boolean!
  violations: [String!]!
}`,
    databaseInfo: {
      type: "PostgreSQL 16 (Compliance Audit Store)",
      databaseName: "policy_compliance_db",
      connectionStringExample: "postgresql://compliance_mgr:CompliancePass2026!@postgres-compliance.internal:5432/policy_compliance_db",
      connectionCode: `import { Pool } from "pg";
export const complianceDbPool = new Pool({
  connectionString: process.env.DATABASE_URL
});`,
      tables: [
        "rego_policies_store",
        "cis_benchmark_historical_scans",
        "opa_decision_audit_log"
      ]
    },
    entrypointCode: `// OPA Compliance Server Entrypoint
console.log("OPA Policy Compliance Service online on port 50055...");`
  },
  {
    id: "ai-architect",
    name: "AI Security Architect Service",
    repositoryName: "secops-ai-architect-service",
    description: "Gemini AI LLM Service running posture evaluation and automated Sigma rule synthesis with Qdrant vector retrieval.",
    port: 50056,
    techStack: ["Node.js / Express", "Google GenAI SDK", "Qdrant Vector DB", "gRPC / Protobuf", "GraphQL"],
    dockerfile: `# Multi-stage Dockerfile for AI Security Assistant & Gemini LLM Service
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist

EXPOSE 50056 8084
ENV PORT=8084
ENV VECTOR_DB_URL=http://qdrant-vectors.internal:6333

ENTRYPOINT ["node", "dist/server.js"]`,
    grpcProto: `syntax = "proto3";

package devsecops.aiarchitect.v1;

service AiArchitectService {
  rpc AnalyzePosture (PostureRequest) returns (PostureResponse);
  rpc SynthesizeSigmaRule (SynthesizeRuleRequest) returns (SynthesizeRuleResponse);
}

message PostureRequest {
  string prompt = 1;
}

message PostureResponse {
  string analysis_text = 1;
  double overall_risk_score = 2;
}`,
    graphqlSchema: `type Query {
  analyzePosture(prompt: String!): PostureAnalysis!
  synthesizeSigma(scenario: String!, logSource: String!, level: String!): SynthesizedSigma!
}`,
    databaseInfo: {
      type: "Qdrant Vector DB (Security Embeddings)",
      databaseName: "secops_vector_store",
      connectionStringExample: "http://qdrant-vectors.internal:6333/collections/mitre_attack_vectors",
      connectionCode: `// Qdrant Vector Client Connection
import { QdrantClient } from "@qdrant/js-client-rest";
export const qdrantClient = new QdrantClient({ url: "http://qdrant-vectors.internal:6333" });`,
      tables: [
        "mitre_attack_technique_embeddings",
        "secops_best_practices_vectors",
        "sigma_rule_templates_index"
      ]
    },
    entrypointCode: `import { GoogleGenAI } from "@google/genai";
console.log("AI Architect Gemini Service online on port 50056...");`
  },
  {
    id: "workspace-lowcode",
    name: "Workspace & Low-Code Platform Service",
    repositoryName: "workspace-lowcode-platform-service",
    description: "Isolated microservice executing Domino/Volt MX low-code schema objects, dynamic form rendering, workflow state transitions, DX content caching, and Matrix E2EE collaboration.",
    port: 50058,
    techStack: ["Node.js 20", "Express / gRPC", "GraphQL", "PostgreSQL (Citus)", "Redis Cache", "Matrix Protocol"],
    dockerfile: `# Multi-stage Dockerfile for Isolated Workspace & Low-Code Platform
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 50058 8086
ENV PORT=8086
ENV GRPC_PORT=50058
ENV DB_HOST=postgres-citus-workspace.internal
ENV REDIS_HOST=redis-dx-cache.internal

ENTRYPOINT ["node", "dist/server.js"]`,
    grpcProto: `syntax = "proto3";

package workspace.lowcode.v1;

service WorkspaceLowCodeService {
  rpc EvaluateWorkflowRule (RuleRequest) returns (RuleResponse);
  rpc IngestCmsAsset (CmsAssetRequest) returns (CmsAssetResponse);
  rpc BroadcastMatrixMessage (MatrixMessageRequest) returns (MatrixMessageResponse);
}

message RuleRequest {
  string object_key = 1;
  string payload_json = 2;
}

message RuleResponse {
  string status = 1;
  bool auto_approved = 2;
  string logs = 3;
}`,
    graphqlSchema: `type CustomSchemaObject {
  id: ID!
  name: String!
  key: String!
  fields: [SchemaField!]!
}

type SchemaField {
  id: ID!
  name: String!
  type: String!
  required: Boolean!
}

type Query {
  getSchemaObjects: [CustomSchemaObject!]!
  getCmsContent(slug: String!, locale: String!): CmsAsset
}

type Mutation {
  evaluateZeroCodeScript(script: String!, recordJson: String!): ScriptResult!
}`,
    databaseInfo: {
      type: "PostgreSQL Citus + Redis Cache",
      databaseName: "workspace_lowcode_db",
      connectionStringExample: "postgres://workspace_usr:SecretPass@postgres-citus-workspace.internal:5432/workspace_lowcode_db",
      connectionCode: `import { Pool } from "pg";
import { Redis } from "ioredis";

export const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
export const redisCache = new Redis({ host: process.env.REDIS_HOST || "redis-dx-cache.internal" });`,
      tables: [
        "custom_schema_objects",
        "custom_schema_fields",
        "workflow_state_transitions",
        "dx_content_assets",
        "matrix_room_megolm_keys"
      ]
    },
    entrypointCode: `import express from "express";
console.log("Workspace & Low-Code Platform Service online on port 50058...");`
  },
  {
    id: "cybersecurity-endpoint",
    name: "Cybersecurity & Endpoint Operations Service",
    repositoryName: "cybersecurity-endpoint-ops-service",
    description: "Isolated microservice running Application Security Scanner (SAST & SCA), Unified Endpoint Management agent heartbeat receiver, patch policy engine, and OS auto-remediation task queue.",
    port: 50059,
    techStack: ["Node.js 20", "Express / gRPC", "GraphQL", "PostgreSQL", "Redis Task Queue", "Open policy agent (OPA)"],
    dockerfile: `# Multi-stage Dockerfile for Isolated Cybersecurity & Endpoint Operations Service
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 50059 8087
ENV PORT=8087
ENV GRPC_PORT=50059
ENV DB_HOST=postgres-secops-db.internal
ENV REDIS_QUEUE=redis-patch-queue.internal

ENTRYPOINT ["node", "dist/server.js"]`,
    grpcProto: `syntax = "proto3";

package cybersecurity.endpoint.v1;

service CybersecurityEndpointService {
  rpc TriggerAstScan (ScanRequest) returns (ScanResponse);
  rpc IngestEndpointTelemetry (TelemetryRequest) returns (TelemetryResponse);
  rpc ExecutePatchRemediation (RemediationRequest) returns (RemediationResponse);
}

message TelemetryRequest {
  string endpoint_id = 1;
  string hostname = 2;
  double cpu_usage = 3;
  double memory_usage = 4;
}

message TelemetryResponse {
  bool accepted = 1;
  string policy_status = 2;
}`,
    graphqlSchema: `type SastFinding {
  id: ID!
  filePath: String!
  line: Int!
  owaspCategory: String!
  severity: String!
  vulnerability: String!
}

type EndpointDevice {
  id: ID!
  hostname: String!
  ipAddress: String!
  os: String!
  status: String!
  complianceScore: Int!
}

type Query {
  getSastFindings: [SastFinding!]!
  getEndpoints: [EndpointDevice!]!
}

type Mutation {
  runAstScan(repoUrl: String!): Boolean!
  executeRemediationTask(taskId: String!): Boolean!
}`,
    databaseInfo: {
      type: "PostgreSQL + Redis Patch Queue",
      databaseName: "cybersecurity_endpoint_db",
      connectionStringExample: "postgres://sec_usr:EncryptedSecret@postgres-secops-db.internal:5432/cybersecurity_endpoint_db",
      connectionCode: `import { Pool } from "pg";
import { Redis } from "ioredis";

export const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
export const redisTaskQueue = new Redis({ host: process.env.REDIS_QUEUE || "redis-patch-queue.internal" });`,
      tables: [
        "ast_scan_findings",
        "dependency_cve_catalog",
        "uem_endpoint_agents",
        "patch_policies",
        "auto_remediation_task_queue"
      ]
    },
    entrypointCode: `import express from "express";
console.log("Cybersecurity & Endpoint Operations Service online on port 50059...");`
  },
  {
    id: "devops-aiops",
    name: "DevOps & Intelligent Operations Service",
    repositoryName: "devops-aiops-orchestration-service",
    description: "Isolated microservice orchestrating event-driven workload jobs (Cron, Webhooks, DAGs), Continuous Deployment pipelines with rollback hooks, and Agentic AI log root-cause analysis.",
    port: 50060,
    techStack: ["Node.js 20", "Express / gRPC", "GraphQL", "PostgreSQL", "Redis Job Queue", "Gemini 2.5 LLM SDK"],
    dockerfile: `# Multi-stage Dockerfile for Isolated DevOps & Agentic AIOps Service
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 50060 8088
ENV PORT=8088
ENV GRPC_PORT=50060
ENV DB_HOST=postgres-devops-db.internal
ENV REDIS_JOB_QUEUE=redis-job-queue.internal

ENTRYPOINT ["node", "dist/server.js"]`,
    grpcProto: `syntax = "proto3";

package devops.aiops.v1;

service DevOpsAiOpsService {
  rpc TriggerWorkloadJob (JobRequest) returns (JobResponse);
  rpc AnalyzeLogStream (LogRequest) returns (LogAnalysisResponse);
  rpc PromoteEnvironmentRelease (ReleaseRequest) returns (ReleaseResponse);
}

message JobRequest {
  string job_id = 1;
  string payload_json = 2;
}

message JobResponse {
  string execution_id = 1;
  string status = 2;
  int64 execution_time_ms = 3;
}`,
    graphqlSchema: `type WorkloadJob {
  id: ID!
  name: String!
  triggerType: String!
  slaLimitMs: Int!
  status: String!
}

type CdEnvironment {
  id: ID!
  name: String!
  currentVersion: String!
  rollbackVersion: String!
  status: String!
}

type Query {
  getWorkloadJobs: [WorkloadJob!]!
  getCdEnvironments: [CdEnvironment!]!
}

type Mutation {
  triggerJob(jobId: String!): Boolean!
  analyzeIncidentLogs(rawLogs: String!): LogAnalysis!
}`,
    databaseInfo: {
      type: "PostgreSQL + Redis Job Queue",
      databaseName: "devops_aiops_db",
      connectionStringExample: "postgres://devops_usr:SecretPass@postgres-devops-db.internal:5432/devops_aiops_db",
      connectionCode: `import { Pool } from "pg";
import { Redis } from "ioredis";

export const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
export const redisJobQueue = new Redis({ host: process.env.REDIS_JOB_QUEUE || "redis-job-queue.internal" });`,
      tables: [
        "workload_job_definitions",
        "workload_job_execution_history",
        "cd_environments",
        "cd_deployment_history",
        "aiops_log_incident_analyses"
      ]
    },
    entrypointCode: `import express from "express";
console.log("DevOps & Intelligent Operations Service online on port 50060...");`
  },
  {
    id: "enterprise-data-analytics",
    name: "Enterprise Data & Analytics Service",
    repositoryName: "enterprise-data-analytics-service",
    description: "Isolated microservice running DataConnect low-code ETL pipeline orchestrator, database schema extractor, and Actian Vector columnar analytical query engine.",
    port: 50061,
    techStack: ["Node.js 20", "Express / gRPC", "GraphQL", "PostgreSQL (Columnar Catalog)", "Actian Vector Engine", "AVX-512 SIMD"],
    dockerfile: `# Multi-stage Dockerfile for Isolated Enterprise Data & Analytics Service
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 50061 8089
ENV PORT=8089
ENV GRPC_PORT=50061
ENV DB_HOST=postgres-analytics-db.internal
ENV ACTIAN_VECTOR_CLUSTER=actian-vector-cluster.internal

ENTRYPOINT ["node", "dist/server.js"]`,
    grpcProto: `syntax = "proto3";

package enterprise.data.v1;

service EnterpriseDataAnalyticsService {
  rpc TriggerEtlPipeline (PipelineRequest) returns (PipelineResponse);
  rpc ExecuteColumnarQuery (QueryRequest) returns (QueryResponse);
  rpc ExtractDatabaseSchema (SchemaRequest) returns (SchemaResponse);
}

message QueryRequest {
  string sql_statement = 1;
  int32 max_rows = 2;
}

message QueryResponse {
  int64 execution_time_ms = 1;
  int64 rows_scanned = 2;
  string json_result_array = 3;
}`,
    graphqlSchema: `type EtlPipeline {
  id: ID!
  name: String!
  sourceConnector: String!
  targetConnector: String!
  status: String!
}

type QueryResult {
  executionTimeMs: Float!
  rowsScanned: Int!
  dataJson: String!
}

type Query {
  getEtlPipelines: [EtlPipeline!]!
  executeColumnarSql(sql: String!): QueryResult!
}

type Mutation {
  runPipeline(pipelineId: String!): Boolean!
  updateFieldMask(columnName: String!, maskType: String!): Boolean!
}`,
    databaseInfo: {
      type: "PostgreSQL + Actian Vector Store",
      databaseName: "enterprise_data_analytics_db",
      connectionStringExample: "postgres://data_usr:EncryptedSecret@postgres-analytics-db.internal:5432/enterprise_data_analytics_db",
      connectionCode: `import { Pool } from "pg";

export const pgCatalogPool = new Pool({ connectionString: process.env.DATABASE_URL });
export const actianVectorCluster = { host: process.env.ACTIAN_VECTOR_CLUSTER || "actian-vector-cluster.internal" };`,
      tables: [
        "etl_pipeline_definitions",
        "etl_transformation_rules",
        "extracted_schema_catalog",
        "columnar_partition_manifests",
        "bi_dashboard_widget_configs"
      ]
    },
    entrypointCode: `import express from "express";
console.log("Enterprise Data & Analytics Service online on port 50061...");`
  }
];
