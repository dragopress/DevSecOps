import React, { useState } from "react";
import { 
  Workflow, 
  GitPullRequest, 
  Bot, 
  Terminal, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  Layers, 
  Server, 
  ShieldCheck, 
  Zap, 
  Copy, 
  Code2, 
  FileCode, 
  Activity, 
  Check, 
  X, 
  Search, 
  Plus, 
  Trash2, 
  Sliders, 
  Cpu, 
  Database, 
  RefreshCw, 
  Sparkles, 
  MessageSquare, 
  ChevronRight, 
  Radio, 
  Lock, 
  Share2, 
  Send, 
  ArrowRight,
  Shield,
  Eye,
  Settings
} from "lucide-react";

// Types for DevOps & Agentic AIOps
export interface WorkloadJob {
  id: string;
  name: string;
  triggerType: 'Cron Schedule' | 'Webhook Event' | 'Dependency DAG';
  scheduleOrEvent: string;
  slaLimitMs: number;
  lastExecutionMs: number;
  retryLimit: number;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'RETRYING';
  lastRunTime: string;
  dependencies: string[];
}

export interface CdEnvironment {
  id: string;
  name: 'Dev' | 'Staging' | 'Production Air-Gapped';
  currentVersion: string;
  rollbackVersion: string;
  status: 'Healthy' | 'Deploying' | 'Approval Required' | 'Degraded';
  activeInstances: number;
  trafficWeightPct: number;
  requiresApproval: boolean;
}

export interface LogAnalysisResult {
  rootCause: string;
  confidenceScore: number;
  affectedService: string;
  remediationScript: string;
  reasoningChain: string[];
}

export const DevOpsAiOpsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scheduler' | 'cd-pipeline' | 'aiops' | 'architecture'>('scheduler');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- 1. ENTERPRISE WORKLOAD SCHEDULER STATE ---
  const [workloadJobs, setWorkloadJobs] = useState<WorkloadJob[]>([
    {
      id: "job-01",
      name: "ETL Financial Ledger Settlement Sync",
      triggerType: "Cron Schedule",
      scheduleOrEvent: "0 0 * * * (Midnight UTC)",
      slaLimitMs: 5000,
      lastExecutionMs: 3420,
      retryLimit: 3,
      status: "SUCCESS",
      lastRunTime: "4 hours ago",
      dependencies: ["kafka_consumer_ledger", "db_snapshot"]
    },
    {
      id: "job-02",
      name: "K8s Microservice Zero-Downtime Rolling Restarter",
      triggerType: "Webhook Event",
      scheduleOrEvent: "POST /api/v1/jobs/trigger-restart",
      slaLimitMs: 12000,
      lastExecutionMs: 8900,
      retryLimit: 5,
      status: "SUCCESS",
      lastRunTime: "22 mins ago",
      dependencies: ["vault_auth"]
    },
    {
      id: "job-03",
      name: "Sovereign Backup & DB Integrity Verifier",
      triggerType: "Dependency DAG",
      scheduleOrEvent: "On Complete: DB_SNAPSHOT_V2",
      slaLimitMs: 8000,
      lastExecutionMs: 14200,
      retryLimit: 2,
      status: "FAILED",
      lastRunTime: "10 mins ago",
      dependencies: ["db_snapshot_v2"]
    }
  ]);

  // Job execution trigger
  const handleRunJob = (jobId: string) => {
    setWorkloadJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'RUNNING' } : j));
    showToast(`Started execution for workload job ${jobId}...`);

    setTimeout(() => {
      setWorkloadJobs(prev => prev.map(j => j.id === jobId ? {
        ...j,
        status: 'SUCCESS',
        lastExecutionMs: Math.floor(Math.random() * 3000) + 1500,
        lastRunTime: 'Just now'
      } : j));
      showToast(`Job ${jobId} finished successfully within SLA bounds!`);
    }, 2000);
  };

  // --- 2. CONTINUOUS DEPLOYMENT (CD) PIPELINE STATE ---
  const [cdEnvironments, setCdEnvironments] = useState<CdEnvironment[]>([
    {
      id: "env-dev",
      name: "Dev",
      currentVersion: "v2.5.0-rc1",
      rollbackVersion: "v2.4.9",
      status: "Healthy",
      activeInstances: 12,
      trafficWeightPct: 100,
      requiresApproval: false
    },
    {
      id: "env-staging",
      name: "Staging",
      currentVersion: "v2.4.9",
      rollbackVersion: "v2.4.8",
      status: "Healthy",
      activeInstances: 24,
      trafficWeightPct: 100,
      requiresApproval: false
    },
    {
      id: "env-prod",
      name: "Production Air-Gapped",
      currentVersion: "v2.4.8",
      rollbackVersion: "v2.4.7",
      status: "Approval Required",
      activeInstances: 64,
      trafficWeightPct: 100,
      requiresApproval: true
    }
  ]);

  const [envConfigVars, setEnvConfigVars] = useState<{ key: string; devVal: string; prodVal: string }[]>([
    { key: "DB_MAX_CONNECTIONS", devVal: "20", prodVal: "500" },
    { key: "ENABLE_CANARY_ROUTING", devVal: "true", prodVal: "true" },
    { key: "LOG_LEVEL", devVal: "debug", prodVal: "info" },
    { key: "ENCRYPTION_ALGORITHM", devVal: "AES-256-GCM", prodVal: "AES-256-GCM" }
  ]);

  // Release Approval Action
  const handleApproveRelease = (envId: string) => {
    setCdEnvironments(prev => prev.map(e => e.id === envId ? { ...e, status: 'Healthy', currentVersion: 'v2.5.0-rc1' } : e));
    showToast("SecOps & DevOps Lead dual-signoff verified. Release v2.5.0-rc1 promoted to Production!");
  };

  // Rollback Action
  const handleRollback = (envId: string) => {
    setCdEnvironments(prev => prev.map(e => {
      if (e.id === envId) {
        return {
          ...e,
          status: 'Healthy',
          currentVersion: e.rollbackVersion
        };
      }
      return e;
    }));
    showToast(`Triggered rollback hook for ${envId}. Reverted canary target.`);
  };

  // --- 3. AGENTIC AI OPERATIONS ENGINE STATE ---
  const [rawLogInput, setRawLogInput] = useState<string>(
`[2026-08-03 10:48:12] ERROR [k8s-pod-auth-8812] org.postgresql.util.PSQLException: FATAL: remaining connection slots are reserved for non-replication superuser connections
  at org.postgresql.core.v3.QueryExecutorImpl.receiveErrorResponse(QueryExecutorImpl.java:2553)
  at org.postgresql.core.v3.QueryExecutorImpl.processResults(QueryExecutorImpl.java:2285)
  at com.zaxxer.hikari.pool.HikariPool.checkException(HikariPool.java:678)
  at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:156)
  at com.acme.banking.auth.DbConnectionManager.acquireSession(DbConnectionManager.java:84)`
  );

  const [aiAnalysisResult, setAiAnalysisResult] = useState<LogAnalysisResult | null>({
    rootCause: "PostgreSQL Database Connection Pool Exhaustion (HikariPool Leak)",
    confidenceScore: 0.96,
    affectedService: "Auth Service Pods (`k8s-pod-auth-8812`)",
    remediationScript: `# Self-Healing Auto-Remediation Workflow
kubectl scale deployment/auth-service --replicas=8 -n production
pg_terminate_backend(pid) FOR deadlocked idle connections;
ALTER USER auth_usr WITH CONNECTION LIMIT 250;`,
    reasoningChain: [
      "Detected PSQLException indicating database connection pool exhaustion.",
      "Identified unreleased HikariPool connections from orphaned auth session requests.",
      "Recommends automated connection pool limit update & graceful pod rolling update."
    ]
  });

  const [aiQueryInput, setAiQueryInput] = useState<string>("Why did staging build #1042 fail during integration test execution?");
  const [aiQueryResult, setAiQueryResult] = useState<string | null>(null);

  const handleRunAiAnalysis = () => {
    showToast("Agentic AI LLM orchestration analyzing raw incident log stream...");
    
    setTimeout(() => {
      setAiAnalysisResult({
        rootCause: "Database Connection Pool Exhaustion & Thread Locking",
        confidenceScore: 0.98,
        affectedService: "k8s-pod-auth-8812",
        remediationScript: `# Auto-Healing Script Executed
kubectl rollout restart deployment/auth-service -n production`,
        reasoningChain: [
          "Ingested PostgreSQL connection error logs.",
          "Matched pattern against known HikariCP pool leak signature.",
          "Generated verified remediation shell script."
        ]
      });
      showToast("Agentic AI Log Analysis complete!");
    }, 1500);
  };

  const handleSendHelpdeskQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQueryInput.trim()) return;

    showToast("Processing natural language query with Agentic AI Engine...");
    setTimeout(() => {
      setAiQueryResult(`[AI AGENT RESPONSE] Staging build #1042 failed due to an expired OAuth client secret in staging vault configuration. 
Recommendation: Rotate secret 'STAGING_OAUTH_CLIENT_SECRET' in Vault and re-run pipeline.`);
      showToast("Helpdesk AI answer generated.");
    }, 1200);
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-800 border border-indigo-500/80 text-indigo-200 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-amber-600 text-white font-bold text-xs rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5" /> Pillar 4 Operational Service
              </span>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-0.5 rounded-md">
                HWA, DevOps Suite & AI Force Integration
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-8 h-8 text-indigo-400" />
              DevOps & Agentic AIOps Orchestration Engine
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Enterprise event-driven workload scheduler (Cron, Webhooks, DAGs), Continuous Deployment (CD) pipeline with rollback hooks, and Agentic AI operations engine for self-healing & log diagnostics.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex flex-col border-r border-slate-800 pr-4">
              <span className="text-slate-400 font-sans font-medium">Workload SLA Pass Rate</span>
              <span className="text-emerald-400 font-bold mt-0.5">99.85% Compliant</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-sans font-medium">Agentic LLM Status</span>
              <span className="text-indigo-400 font-bold mt-0.5">Gemini 2.5 Active</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'scheduler'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-300" />
            <span>Enterprise Workload Scheduler (HWA Engine)</span>
          </button>

          <button
            onClick={() => setActiveTab('cd-pipeline')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cd-pipeline'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <GitPullRequest className="w-4 h-4 text-emerald-300" />
            <span>Continuous Deployment (CD) & Rollbacks</span>
          </button>

          <button
            onClick={() => setActiveTab('aiops')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'aiops'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-300" />
            <span>Agentic AI Operations & Self-Healing</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Code2 className="w-4 h-4 text-indigo-300" />
            <span>Microservice Repo & Contracts</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ENTERPRISE WORKLOAD SCHEDULER */}
      {activeTab === 'scheduler' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Workload Automation & Event-Driven Job Orchestrator
              </h2>
              <p className="text-xs text-slate-400">Triggers jobs based on Cron schedules, Webhook events, and DAG dependencies with strict SLA monitoring.</p>
            </div>

            <span className="text-xs font-mono text-amber-300 bg-amber-950 px-3 py-1 rounded-full border border-amber-800 font-bold">
              Scheduler Daemon Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Jobs Stream Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-indigo-400" />
                  Scheduled Workloads & Execution SLAs
                </h3>
                <span className="text-xs font-mono text-slate-400">3 Registered Jobs</span>
              </div>

              <div className="space-y-3">
                {workloadJobs.map(job => {
                  const isSlaBreached = job.lastExecutionMs > job.slaLimitMs;
                  return (
                    <div key={job.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{job.name}</span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          job.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : job.status === 'RUNNING'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}>
                          {job.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400">
                        <div>Trigger: <strong className="text-amber-300">{job.triggerType}</strong></div>
                        <div>Schedule/Event: <strong className="text-slate-300">{job.scheduleOrEvent}</strong></div>
                        <div>Retries: <strong className="text-purple-300">{job.retryLimit} MAX</strong></div>
                      </div>

                      {/* SLA Meter */}
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">Execution Time:</span>
                          <span className={`font-bold ${isSlaBreached ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {job.lastExecutionMs}ms / SLA Limit {job.slaLimitMs}ms
                          </span>
                        </div>

                        {isSlaBreached ? (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> SLA Breached
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> SLA Passed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500">Dependencies: {job.dependencies.join(", ")}</span>

                        <button
                          onClick={() => handleRunJob(job.id)}
                          disabled={job.status === 'RUNNING'}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Trigger Manual Execution</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SLA Metrics Dashboard */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  SLA Monitoring & Retry Queue
                </h3>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300">Global SLA Performance</div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">99.85%</div>
                <p className="text-[11px] text-slate-400">All workload jobs executed within defined SLA limits in the last 24 hours.</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300">Exponential Backoff Policy</div>
                <div className="text-xs font-mono text-indigo-300">
                  Retry 1: 10s delay<br/>
                  Retry 2: 30s delay<br/>
                  Retry 3: 120s delay
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTINUOUS DEPLOYMENT (CD) PIPELINE */}
      {activeTab === 'cd-pipeline' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-emerald-400" />
                Continuous Deployment (CD) Pipeline Engine
              </h2>
              <p className="text-xs text-slate-400">Manages releases across Dev, Staging, and Production Air-Gapped clusters with deployment rollback hooks.</p>
            </div>

            <span className="text-xs font-mono text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800 font-bold">
              ArgoCD / Spinnaker Engine Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CD Environments List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  Deployment Environments & Rollback Hooks
                </h3>
              </div>

              <div className="space-y-3">
                {cdEnvironments.map(env => (
                  <div key={env.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{env.name}</span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        env.status === 'Healthy'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : env.status === 'Approval Required'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      }`}>
                        {env.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400">
                      <div>Current: <strong className="text-emerald-400">{env.currentVersion}</strong></div>
                      <div>Rollback Target: <strong className="text-amber-300">{env.rollbackVersion}</strong></div>
                      <div>Pods: <strong className="text-indigo-300">{env.activeInstances} Replicas</strong></div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      {env.requiresApproval && env.status === 'Approval Required' ? (
                        <button
                          onClick={() => handleApproveRelease(env.id)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Approve Production Release v2.5.0-rc1</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">Auto-Sync Enabled</span>
                      )}

                      <button
                        onClick={() => handleRollback(env.id)}
                        className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Trigger Rollback to {env.rollbackVersion}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Environment Config Map Manager */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  ConfigMap & Feature Flags
                </h3>
              </div>

              <div className="space-y-2">
                {envConfigVars.map((v, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                    <div className="font-bold text-indigo-300">{v.key}</div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Dev: <strong className="text-slate-200">{v.devVal}</strong></span>
                      <span>Prod: <strong className="text-emerald-400">{v.prodVal}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AGENTIC AI OPERATIONS ENGINE */}
      {activeTab === 'aiops' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                Agentic AI Operations & Self-Healing Engine (AI Force)
              </h2>
              <p className="text-xs text-slate-400">LLM orchestration for automated root-cause log analysis, self-healing script generation, and natural language helpdesk querying.</p>
            </div>

            <span className="text-xs font-mono text-purple-300 bg-purple-950 px-3 py-1 rounded-full border border-purple-800 font-bold">
              Gemini 2.5 Pro Agent Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Log Diagnostic Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Raw Incident Log Stream & Diagnostic Runner
                </h3>

                <button
                  onClick={handleRunAiAnalysis}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze with Gemini LLM</span>
                </button>
              </div>

              <textarea
                value={rawLogInput}
                onChange={(e) => setRawLogInput(e.target.value)}
                rows={7}
                className="w-full bg-slate-950 border border-slate-800 text-indigo-300 p-3 rounded-xl font-mono text-[11px] focus:outline-none"
              />

              {aiAnalysisResult && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-purple-300">Root Cause Identified:</span>
                    <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold">
                      {(aiAnalysisResult.confidenceScore * 100).toFixed(0)}% Confidence
                    </span>
                  </div>

                  <p className="text-white font-sans text-xs font-bold">{aiAnalysisResult.rootCause}</p>

                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px]">Reasoning Chain:</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1 font-sans">
                      {aiAnalysisResult.reasoningChain.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto">
                    <div className="text-slate-400 mb-1">// Self-Healing Remediation Script:</div>
                    <code>{aiAnalysisResult.remediationScript}</code>
                  </div>
                </div>
              )}
            </div>

            {/* Natural Language Helpdesk AI Querying */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  Natural Language Helpdesk & Ops Assistant
                </h3>
              </div>

              <form onSubmit={handleSendHelpdeskQuery} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Ask AIOps Assistant:</label>
                  <input
                    type="text"
                    value={aiQueryInput}
                    onChange={(e) => setAiQueryInput(e.target.value)}
                    placeholder="e.g. Why did staging build #1042 fail?"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 text-xs font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Query AIOps Knowledge Base</span>
                </button>
              </form>

              {aiQueryResult && (
                <div className="p-4 bg-slate-950 rounded-xl border border-indigo-800/60 font-mono text-xs text-indigo-200 leading-relaxed">
                  {aiQueryResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ARCHITECTURE & CONTRACTS */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                Service Repo Architecture: `devops-aiops-service`
              </h2>
              <p className="text-xs text-slate-400">Isolated service repository with custom Dockerfile, gRPC/Protobuf contracts, and PostgreSQL workload database.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-indigo-300 font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                `services/devops-aiops/Dockerfile`
              </span>
              <pre className="bg-slate-900 p-3 rounded-lg text-emerald-300 font-mono text-[11px] overflow-x-auto">
{`FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 50060
CMD ["node", "dist/server.cjs"]`}
              </pre>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                `proto/devops_v1.proto` (gRPC Contract)
              </span>
              <pre className="bg-slate-900 p-3 rounded-lg text-indigo-300 font-mono text-[11px] overflow-x-auto">
{`syntax = "proto3";
package devops.aiops.v1;

service DevOpsAiOpsService {
  rpc TriggerWorkloadJob (JobRequest) returns (JobResponse);
  rpc AnalyzeLogStream (LogRequest) returns (LogAnalysisResponse);
  rpc PromoteEnvironmentRelease (ReleaseRequest) returns (ReleaseResponse);
}

message JobRequest {
  string job_id = 1;
  string payload_json = 2;
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
