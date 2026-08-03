import React, { useState } from "react";
import { 
  Building2, 
  ShieldCheck, 
  Layers, 
  Database, 
  Code2, 
  Server, 
  Cpu, 
  KeyRound, 
  Lock, 
  Terminal, 
  Copy, 
  Check, 
  FolderTree, 
  Sparkles, 
  Workflow, 
  Users, 
  Globe, 
  Radio, 
  Compass, 
  Search, 
  ChevronRight, 
  Zap, 
  RefreshCw, 
  FileCode, 
  Play, 
  BarChart3, 
  Bot, 
  CheckCircle2, 
  Boxes, 
  ShieldAlert, 
  LayoutGrid, 
  Network
} from "lucide-react";
import { EnterpriseTenant } from "../types";

export const EnterpriseSaaSControlPlane: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'multitenancy' | 'pillars' | 'api-gateway' | 'directory'>('architecture');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedPillarId, setSelectedPillarId] = useState<string>("martech");
  const [activeTenantId, setActiveTenantId] = useState<string>("tenant-01");
  const [graphqlQuery, setGraphqlQuery] = useState<string>(`query GetTenantControlPlane {
  tenant(id: "tenant-01") {
    name
    tier
    ssoConfig {
      provider
      issuerUrl
    }
    enabledPillars {
      id
      name
      status
    }
  }
}`);
  const [graphqlResponse, setGraphqlResponse] = useState<string | null>(null);
  const [isExecutingApi, setIsExecutingApi] = useState<boolean>(false);

  const mockTenants: EnterpriseTenant[] = [
    {
      id: "tenant-01",
      name: "Acme Global Banking Corp",
      slug: "acme-banking",
      tier: "ENTERPRISE_PLATINUM",
      ssoProvider: "OIDC_OKTA",
      isolationType: "RLS_SHARED_DB",
      region: "us-east-1",
      enabledPillars: ["Customer Experience & MarTech", "Cybersecurity & UEM", "Intelligent DevOps", "Enterprise Data"],
      activeUsersCount: 14250,
      createdAt: "2026-01-15"
    },
    {
      id: "tenant-02",
      name: "AeroTech Defense Systems",
      slug: "aerotech-gov",
      tier: "FEDRAMP_GOV",
      ssoProvider: "SAML2_AZURE_AD",
      isolationType: "DB_PER_TENANT",
      region: "us-east-1",
      enabledPillars: ["Workspace & Low-Code", "Cybersecurity & UEM", "Intelligent DevOps"],
      activeUsersCount: 8900,
      createdAt: "2026-02-01"
    },
    {
      id: "tenant-03",
      name: "BioPharma Health EU",
      slug: "biopharma-eu",
      tier: "ENTERPRISE_GOLD",
      ssoProvider: "PING_IDENTITY",
      isolationType: "RLS_SHARED_DB",
      region: "eu-central-1",
      enabledPillars: ["Customer Experience & MarTech", "Workspace & Low-Code", "Enterprise Data"],
      activeUsersCount: 6100,
      createdAt: "2026-03-10"
    }
  ];

  const pillars = [
    {
      id: "martech",
      number: "1",
      title: "Customer Experience & MarTech",
      subtitle: "Commerce, CDP, Marketing Automation, Journey Analytics",
      description: "Unified customer identity graph, headless commerce engine, real-time segmentation, and omnichannel campaign orchestration.",
      services: ["commerce-engine-service", "cdp-customer-graph", "campaign-orchestrator", "journey-analytics-v2"],
      techStack: ["Node.js / Express", "PostgreSQL (RLS)", "Redis PubSub", "GraphQL Mesh"],
      database: "customer_experience_db (PostgreSQL 16 + Citus Scale)",
      grpcEndpoints: ["ExecuteCampaign", "ResolveCustomerIdentity", "GetJourneyMetrics"],
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-400"
    },
    {
      id: "workspace",
      number: "2",
      title: "Workspace & Low-Code Collaboration",
      subtitle: "Low-Code App Builder, Portal/CMS, Real-Time Chat/Meetings",
      description: "Enterprise portal builder, drag-and-drop form/app designer, web-RTC collaborative rooms, and structured document management.",
      services: ["lowcode-builder-service", "portal-cms-service", "collaboration-rtc-service", "content-repository"],
      techStack: ["TypeScript / React", "WebSockets / Socket.io", "MongoDB / Document Engine", "S3 Storage"],
      database: "workspace_collab_db (MongoDB Atlas / PostgreSQL JSONB)",
      grpcEndpoints: ["DeployLowCodeApp", "PublishPortalPage", "InitiateRtcRoom"],
      color: "from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-400"
    },
    {
      id: "cybersecurity",
      number: "3",
      title: "Cybersecurity & Unified Endpoint Management",
      subtitle: "AppSec AST Scanning, Endpoint Patching & CIS Compliance",
      description: "Continuous SAST/DAST vulnerability scanning, BigFix-inspired endpoint patch deployment, and real-time threat intelligence.",
      services: ["appsec-ast-scanner", "endpoint-patching-service", "threat-intelligence-engine", "cis-compliance-auditor"],
      techStack: ["Go / Rust", "PostgreSQL", "Checkov / Semgrep AST Engine", "Kafka Events"],
      database: "cybersecurity_uem_db (PostgreSQL + TimescaleDB)",
      grpcEndpoints: ["ScanAstRepository", "DeployEndpointPatch", "EvaluateCisCompliance"],
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400"
    },
    {
      id: "devops",
      number: "4",
      title: "Intelligent DevOps & Operations",
      subtitle: "Workload Scheduler, CI/CD Pipeline Automation, GenAI Agent Ops",
      description: "Enterprise Workload Automation (HCL Workload Automation equivalent), GitOps CI/CD engine, and autonomous AI remediation agents.",
      services: ["workload-scheduler-service", "gitops-pipeline-engine", "genai-ops-agent", "incident-remediation"],
      techStack: ["Python / FastAPI", "Temporal.io Workflow Engine", "PostgreSQL", "Gemini 2.5 API"],
      database: "devops_operations_db (PostgreSQL 16 + Temporal DB)",
      grpcEndpoints: ["ScheduleWorkloadJob", "TriggerGitOpsPipeline", "ExecuteAiRemediation"],
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400"
    },
    {
      id: "analytics",
      number: "5",
      title: "Enterprise Data & Analytics",
      subtitle: "ETL/ELT Data Integration, Columnar Data Warehouse Engine",
      description: "HCL Unica/DataStage style data integration pipelines, Apache Iceberg/Parquet data lakehouse, and ClickHouse/Trino analytics.",
      services: ["etl-pipeline-orchestrator", "columnar-warehouse-engine", "iceberg-catalog-service", "bi-dashboards-v3"],
      techStack: ["Java / Apache Arrow", "ClickHouse Columnar", "Apache Iceberg", "AWS Glue / Athena"],
      database: "enterprise_data_lakehouse (ClickHouse Columnar + S3 Parquet)",
      grpcEndpoints: ["RunEtlJob", "ExecuteWarehouseQuery", "SyncIcebergCatalog"],
      color: "from-indigo-500/20 to-violet-500/20 border-indigo-500/40 text-indigo-400"
    }
  ];

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const executeApiQuery = () => {
    setIsExecutingApi(true);
    setGraphqlResponse(null);
    setTimeout(() => {
      const tenant = mockTenants.find(t => t.id === activeTenantId) || mockTenants[0];
      setGraphqlResponse(JSON.stringify({
        data: {
          tenant: {
            id: tenant.id,
            name: tenant.name,
            tier: tenant.tier,
            ssoConfig: {
              provider: tenant.ssoProvider,
              issuerUrl: `https://${tenant.slug}.sso.enterprise-suite.com/oauth2/v1`
            },
            isolationType: tenant.isolationType,
            enabledPillars: tenant.enabledPillars.map(p => ({
              name: p,
              status: "ACTIVE_HEALTHY"
            }))
          }
        },
        extensions: {
          executionTimeMs: 14,
          rlsPolicyApplied: "tenant_isolation_policy ON current_setting('app.current_tenant_id')"
        }
      }, null, 2));
      setIsExecutingApi(false);
    }, 400);
  };

  const sqlSchemaCode = `-- PostgreSQL 16 Multi-Tenant Identity & SSO Schema with Row-Level Security (RLS)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants Registry
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'ENTERPRISE_GOLD',
    isolation_type VARCHAR(50) NOT NULL DEFAULT 'RLS_SHARED_DB',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Identity Providers (OIDC / SAML 2.0 SSO)
CREATE TABLE IF NOT EXISTS identity_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    provider_type VARCHAR(50) NOT NULL, -- 'OIDC_OKTA', 'SAML2_AZURE_AD', 'PING_IDENTITY'
    client_id VARCHAR(255) NOT NULL,
    client_secret_hash VARCHAR(255),
    issuer_url VARCHAR(512) NOT NULL,
    sso_metadata_xml TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table (Tenant-Scoped)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    sso_subject_id VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

-- 4. Multi-Tenant RBAC Roles & Permissions
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    UNIQUE(tenant_id, role_name)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- =========================================================================
-- ROW-LEVEL SECURITY (RLS) TENANT ISOLATION POLICIES
-- =========================================================================

-- Enable RLS on all tenant-aware tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create Tenant Isolation Policies enforcing 'app.current_tenant_id'
CREATE POLICY tenant_isolation_users ON users
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_roles ON roles
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_user_roles ON user_roles
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
`;

  const monorepoTree = `hcl-enterprise-platform/
├── apps/
│   ├── control-plane-web/             # Unified Control Plane React Portal (Port 3000)
│   ├── martech-cx-web/                # Customer Experience & CDP Dashboard
│   └── workspace-lowcode-portal/     # Low-Code Form Builder & CMS Portal
├── services/
│   ├── identity-sso-service/          # OIDC/SAML 2.0 Auth & Tenant Management (gRPC :50051)
│   ├── customer-martech-service/      # Commerce & Journey Analytics Service (gRPC :50052)
│   ├── workspace-collab-service/      # Real-time WebSockets & LowCode Engine (gRPC :50053)
│   ├── cybersecurity-uem-service/     # AST Scanner & Endpoint Patching Engine (gRPC :50054)
│   ├── devops-scheduler-service/      # HCL Workload Automation & GitOps (gRPC :50055)
│   └── data-warehouse-service/        # Columnar ClickHouse & Iceberg Lake (gRPC :50056)
├── packages/
│   ├── shared-rls-db/                 # Drizzle/Prisma Multi-Tenant RLS Helpers
│   ├── api-contracts-grpc/            # Protocol Buffers (.proto) for all 5 Pillars
│   ├── event-bus-topics/              # Kafka / Redis PubSub Message Contracts
│   └── auth-middleware/               # Express/Koa JWT & SAML Guard Middleware
├── docker-compose.yml                 # Local Microservices Dev Stack
└── k8s-helm-charts/                   # Cloud-Native Kubernetes Helm Charts
`;

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs rounded-full uppercase tracking-wider shadow-md">
                Cloud-Native Control Plane
              </span>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-md">
                HCL Suite Inspired Architecture
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-8 h-8 text-indigo-400" />
              Enterprise SaaS Modular Platform
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Architectural control plane unifying 5 core operational pillars into an API-first, multi-tenant modular monolith with Row-Level Security (RLS), OIDC/SAML 2.0 SSO, and event-driven microservices contracts.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex flex-col border-r border-slate-800 pr-4">
              <span className="text-slate-400 font-medium">Tenant Isolation</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> PostgreSQL RLS Active
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-medium">Core Operational Pillars</span>
              <span className="text-indigo-300 font-mono font-bold mt-0.5">5 Unified Engines</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSection('architecture')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'architecture'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>1. Technical Architecture & Tech Stack</span>
          </button>

          <button
            onClick={() => setActiveSection('multitenancy')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'multitenancy'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>2. Multi-Tenant Identity & RLS Schema</span>
          </button>

          <button
            onClick={() => setActiveSection('pillars')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'pillars'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>3. The 5 Operational Pillars</span>
          </button>

          <button
            onClick={() => setActiveSection('api-gateway')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'api-gateway'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>4. Core API Layer & GraphQL Gateway</span>
          </button>

          <button
            onClick={() => setActiveSection('directory')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'directory'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>5. Monorepo Repository Structure</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TECHNICAL ARCHITECTURE & TECH STACK RECOMMENDATIONS */}
      {activeSection === 'architecture' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all space-y-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">Modular Monolith / Microservices</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Domain-Driven Design (DDD) layout where each of the 5 operational pillars is isolated as a self-contained domain module with its own API boundaries, data stores, and event topics.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/50 transition-all space-y-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">Multi-Tenant RLS Security</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                PostgreSQL Row-Level Security (RLS) automatically enforces <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded font-mono">tenant_id</code> boundaries on all database queries, preventing cross-tenant data leakages.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition-all space-y-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg w-fit">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">Event Broker Message Bus</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Asynchronous event orchestration via Kafka, RabbitMQ, or Redis PubSub for real-time customer journey events, endpoint telemetry, and workload execution notifications.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Workflow className="w-5 h-5 text-indigo-400" />
              Platform Stack Architecture Specification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <span className="text-indigo-400 font-semibold uppercase text-[10px] tracking-wider">Core Runtime</span>
                <div className="font-bold text-slate-100 text-sm">Node.js 22 / Go / Rust</div>
                <p className="text-slate-400 text-[11px]">High throughput gRPC microservices and GraphQL federation gateway.</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <span className="text-cyan-400 font-semibold uppercase text-[10px] tracking-wider">Database & Storage</span>
                <div className="font-bold text-slate-100 text-sm">PostgreSQL 16 + ClickHouse</div>
                <p className="text-slate-400 text-[11px]">Relational operational state with RLS + Columnar log warehouse engine.</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <span className="text-purple-400 font-semibold uppercase text-[10px] tracking-wider">Authentication & SSO</span>
                <div className="font-bold text-slate-100 text-sm">OIDC + SAML 2.0 SSO</div>
                <p className="text-slate-400 text-[11px]">Okta, Azure AD, and Ping Identity integration with tenant-scoped RBAC/ABAC.</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <span className="text-emerald-400 font-semibold uppercase text-[10px] tracking-wider">Container Orchestration</span>
                <div className="font-bold text-slate-100 text-sm">Kubernetes & Docker</div>
                <p className="text-slate-400 text-[11px]">Cloud-native Helm charts with auto-scaling microservices pods.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-TENANT IDENTITY & SSO DATABASE SCHEMA (RLS) */}
      {activeSection === 'multitenancy' && (
        <div className="space-y-6 animate-fade-in">
          {/* Active Tenant Switcher Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Multi-Tenant Identity & Isolation Control
                </h3>
                <p className="text-xs text-slate-400">Select an enterprise tenant to simulate active session RLS database isolation.</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400">Active Session Context:</span>
                <select
                  value={activeTenantId}
                  onChange={(e) => setActiveTenantId(e.target.value)}
                  className="bg-slate-950 border border-indigo-500/50 text-indigo-200 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {mockTenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.slug}) [{t.tier}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Tenant Details Card */}
            {(() => {
              const currentTenant = mockTenants.find(t => t.id === activeTenantId) || mockTenants[0];
              return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                    <div className="text-slate-400 font-medium">Tenant Slug & Tier</div>
                    <div className="text-indigo-300 font-bold font-mono mt-1">{currentTenant.slug}</div>
                    <div className="text-[10px] text-amber-400 font-semibold mt-0.5">{currentTenant.tier}</div>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                    <div className="text-slate-400 font-medium">SSO Provider</div>
                    <div className="text-emerald-400 font-bold font-mono mt-1">{currentTenant.ssoProvider}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">OIDC Client ID: <span className="text-slate-200 font-mono">cli_88291029</span></div>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                    <div className="text-slate-400 font-medium">Isolation Architecture</div>
                    <div className="text-cyan-400 font-bold font-mono mt-1">{currentTenant.isolationType}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">RLS Constraint Enforced</div>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                    <div className="text-slate-400 font-medium">Enabled Pillars Count</div>
                    <div className="text-purple-300 font-bold font-mono mt-1">{currentTenant.enabledPillars.length} Operational Domains</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Active Users: {currentTenant.activeUsersCount.toLocaleString()}</div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* DDL SQL Schema Viewer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                PostgreSQL Multi-Tenant SSO & RLS DDL Schema
              </h3>
              <button
                onClick={() => handleCopy(sqlSchemaCode, "sql-schema")}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
              >
                {copiedCode === "sql-schema" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied SQL</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy DDL Script</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-300 max-h-96 leading-relaxed">
              <pre>{sqlSchemaCode}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: THE 5 OPERATIONAL PILLARS DEEP DIVE */}
      {activeSection === 'pillars' && (
        <div className="space-y-6 animate-fade-in">
          {/* Pillar Selector Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {pillars.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPillarId(p.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPillarId === p.id
                    ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-950/60 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Pillar {p.number}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="font-bold text-white text-xs leading-snug">{p.title}</div>
                </div>
                <div className="text-[10px] text-slate-400 mt-3">{p.services.length} Services</div>
              </button>
            ))}
          </div>

          {/* Detailed Selected Pillar Card */}
          {(() => {
            const currentPillar = pillars.find(p => p.id === selectedPillarId) || pillars[0];
            return (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-mono rounded font-bold">
                        Pillar #{currentPillar.number}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Domain Service Group</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{currentPillar.title}</h2>
                    <p className="text-xs text-indigo-300 font-medium">{currentPillar.subtitle}</p>
                  </div>

                  <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-xs font-mono">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-slate-400 text-[10px]">Database Connection</div>
                      <div className="text-slate-200 font-semibold">{currentPillar.database}</div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{currentPillar.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Microservices list */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-purple-400" />
                      Isolated Microservices Repositories
                    </h4>
                    <div className="space-y-2">
                      {currentPillar.services.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800 text-xs font-mono text-slate-200">
                          <span>{s}</span>
                          <span className="text-[10px] text-emerald-400 font-bold">ONLINE</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech stack */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      Technology Stack
                    </h4>
                    <div className="space-y-2">
                      {currentPillar.techStack.map((tech, idx) => (
                        <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800 text-xs font-medium text-cyan-200">
                          {tech}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* gRPC Endpoints */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <Radio className="w-4 h-4 text-amber-400" />
                      Protocol Buffer gRPC Contracts
                    </h4>
                    <div className="space-y-2 font-mono text-xs">
                      {currentPillar.grpcEndpoints.map((rpc, idx) => (
                        <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800 text-amber-300 flex items-center justify-between">
                          <span>rpc {rpc}()</span>
                          <span className="text-[10px] text-slate-500">v1.0</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 4: CORE API LAYER & GRAPHQL GATEWAY */}
      {activeSection === 'api-gateway' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Network className="w-5 h-5 text-indigo-400" />
                  GraphQL Federation Core API Layer & Explorer
                </h3>
                <p className="text-xs text-slate-400">Test cross-pillar GraphQL federation query with active tenant RLS context header.</p>
              </div>

              <button
                onClick={executeApiQuery}
                disabled={isExecutingApi}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isExecutingApi ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>Execute GraphQL Request</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>GraphQL Request Query</span>
                  <span className="text-[10px] text-cyan-400">Header: x-tenant-id={activeTenantId}</span>
                </label>
                <textarea
                  value={graphqlQuery}
                  onChange={(e) => setGraphqlQuery(e.target.value)}
                  className="w-full h-64 bg-slate-950 text-indigo-200 border border-slate-800 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Federated GraphQL Response</span>
                  <span className="text-[10px] text-emerald-400">200 OK (gRPC Gateway)</span>
                </label>
                <div className="w-full h-64 bg-slate-950 text-emerald-300 border border-slate-800 rounded-lg p-3 overflow-y-auto font-mono text-xs leading-relaxed">
                  {graphqlResponse ? (
                    <pre>{graphqlResponse}</pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-600 font-sans text-xs">
                      Click "Execute GraphQL Request" to query the federated Core API Layer.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MONOREPO REPOSITORY STRUCTURE */}
      {activeSection === 'directory' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-indigo-400" />
                Enterprise Platform Directory Monorepo Layout
              </h3>
              <button
                onClick={() => handleCopy(monorepoTree, "monorepo-tree")}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
              >
                {copiedCode === "monorepo-tree" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Tree</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Directory Layout</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-indigo-300 leading-relaxed overflow-x-auto">
              <pre>{monorepoTree}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
