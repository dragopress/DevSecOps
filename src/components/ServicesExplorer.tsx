import React, { useState } from "react";
import {
  Boxes,
  Container,
  FileCode,
  Database,
  Network,
  Play,
  Download,
  CheckCircle2,
  Terminal,
  Shield,
  Copy,
  Check,
  Server,
  Layers,
  Cpu,
  Workflow,
  Zap,
  HardDrive
} from "lucide-react";
import { isolatedServicesList } from "../data/isolatedServicesData";
import { IsolatedServiceModule } from "../types";

export function ServicesExplorer() {
  const [selectedServiceId, setSelectedServiceId] = useState<string>("cicd-scanner");
  const [activeSubTab, setActiveSubTab] = useState<"dockerfile" | "grpc" | "graphql" | "database" | "sandbox">("dockerfile");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Interactive API Sandbox state
  const [sandboxApiProtocol, setSandboxApiProtocol] = useState<"grpc" | "graphql">("grpc");
  const [sandboxEndpointMethod, setSandboxEndpointMethod] = useState<string>("");
  const [sandboxIsExecuting, setSandboxIsExecuting] = useState<boolean>(false);
  const [sandboxResponse, setSandboxResponse] = useState<any | null>(null);
  const [sandboxExecutionTime, setSandboxExecutionTime] = useState<number | null>(null);

  const activeService = isolatedServicesList.find(s => s.id === selectedServiceId) || isolatedServicesList[0];

  const handleCopyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadServiceRepo = (service: IsolatedServiceModule) => {
    const bundle = {
      repositoryName: service.repositoryName,
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      techStack: service.techStack,
      dockerfile: service.dockerfile,
      grpcProto: service.grpcProto,
      graphqlSchema: service.graphqlSchema,
      database: service.databaseInfo,
      entrypointCode: service.entrypointCode
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${service.repositoryName}-isolated-service.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunSandboxTest = () => {
    setSandboxIsExecuting(true);
    setSandboxResponse(null);
    setSandboxExecutionTime(null);

    setTimeout(() => {
      setSandboxIsExecuting(false);
      setSandboxExecutionTime(Math.floor(Math.random() * 25) + 8);

      if (sandboxApiProtocol === "grpc") {
        if (activeService.id === "cicd-scanner") {
          setSandboxResponse({
            status: "OK_GRPC_200",
            pipeline_run_id: "pipe-run-9921-a12",
            triggered_at: new Date().toISOString(),
            stages: [
              { stage_id: "s1", name: "Source Verification", status: "PASSED", duration_ms: 120 },
              { stage_id: "s2", name: "Secret Audit (gitleaks)", status: "PASSED", duration_ms: 450 },
              { stage_id: "s3", name: "IaC Checkov Scan", status: "PASSED", duration_ms: 820 }
            ],
            checkov_passed_checks: 18,
            checkov_failed_checks: 0
          });
        } else if (activeService.id === "threat-detection") {
          setSandboxResponse({
            status: "OK_GRPC_200",
            is_valid: true,
            rule_id: "sig-f4a88398-31bc",
            title: "SSH Brute Force Authentication",
            siem_compilations: {
              splunk_spl: 'index=linux_auth process="sshd" "Failed password" | stats count by src_ip | filter count > 5',
              sentinel_kql: 'Syslog | where Facility == "auth" and SyslogMessage has "Failed password" | summarize count() by HostIP'
            }
          });
        } else {
          setSandboxResponse({
            status: "OK_GRPC_200",
            message: `gRPC call to ${activeService.name} executed successfully.`,
            service_port: activeService.port,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        setSandboxResponse({
          status: "GRAPHQL_200_OK",
          data: {
            serviceName: activeService.name,
            repository: activeService.repositoryName,
            health: "HEALTHY",
            databaseEngine: activeService.databaseInfo.type,
            activeConnectionPool: 12,
            queryLatencyMs: 4.2
          }
        });
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Boxes className="w-80 h-80 text-cyan-500" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-lg">
                <Boxes className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">
                  Decoupled Microservices Repository Architecture
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  Isolated Service Modules with Dockerfiles, gRPC / GraphQL API Contracts & Dedicated Database Connections
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed mt-2">
              Every DevSecOps studio module is architected as an autonomous microservice repository featuring multi-stage containerization, high-performance gRPC protobuf RPC contracts, GraphQL schemas, and isolated database engine connectors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownloadServiceRepo(activeService)}
              className="px-4 py-2 bg-cyan-900 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export {activeService.repositoryName}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Service Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {isolatedServicesList.map((service) => {
          const isSelected = service.id === selectedServiceId;
          return (
            <button
              key={service.id}
              onClick={() => {
                setSelectedServiceId(service.id);
                setSandboxResponse(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "bg-slate-900 border-cyan-500 ring-1 ring-cyan-500 shadow-lg"
                  : "bg-slate-950/80 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Container className={`w-4 h-4 ${isSelected ? "text-cyan-400" : "text-slate-400"}`} />
                  <span className="font-bold text-xs text-slate-100 truncate">{service.name}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 font-semibold">
                  Port :{service.port}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-1">
                {service.techStack.slice(0, 4).map((tech, i) => (
                  <span key={i} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {tech}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Service Module Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Module Header Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span className="font-mono font-bold text-sm text-cyan-300">{activeService.repositoryName}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                Isolated Service
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{activeService.description}</p>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveSubTab("dockerfile")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "dockerfile"
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Container className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dockerfile</span>
            </button>

            <button
              onClick={() => setActiveSubTab("grpc")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "grpc"
                  ? "bg-purple-950 text-purple-300 border border-purple-800"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Network className="w-3.5 h-3.5 text-purple-400" />
              <span>gRPC (.proto)</span>
            </button>

            <button
              onClick={() => setActiveSubTab("graphql")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "graphql"
                  ? "bg-pink-950 text-pink-300 border border-pink-800"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Workflow className="w-3.5 h-3.5 text-pink-400" />
              <span>GraphQL Schema</span>
            </button>

            <button
              onClick={() => setActiveSubTab("database")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "database"
                  ? "bg-amber-950 text-amber-300 border border-amber-800"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Database Connection</span>
            </button>

            <button
              onClick={() => setActiveSubTab("sandbox")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "sandbox"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>API Sandbox</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="p-6">
          {/* Dockerfile Subtab */}
          {activeSubTab === "dockerfile" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-300 font-mono">
                  <Container className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold">Multi-Stage Container Specification</span>
                  <span className="text-slate-500">({activeService.repositoryName}/Dockerfile)</span>
                </div>
                <button
                  onClick={() => handleCopyCode(activeService.dockerfile, "dockerfile")}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedField === "dockerfile" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "dockerfile" ? "Copied" : "Copy Dockerfile"}</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto max-h-[450px]">
                <pre>{activeService.dockerfile}</pre>
              </div>
            </div>
          )}

          {/* gRPC Subtab */}
          {activeSubTab === "grpc" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-300 font-mono">
                  <Network className="w-4 h-4 text-purple-400" />
                  <span className="font-bold">gRPC Protocol Buffers Contract v1</span>
                  <span className="text-slate-500">(service.proto)</span>
                </div>
                <button
                  onClick={() => handleCopyCode(activeService.grpcProto, "proto")}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedField === "proto" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "proto" ? "Copied" : "Copy .proto"}</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-purple-300 leading-relaxed overflow-x-auto max-h-[450px]">
                <pre>{activeService.grpcProto}</pre>
              </div>
            </div>
          )}

          {/* GraphQL Subtab */}
          {activeSubTab === "graphql" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-300 font-mono">
                  <Workflow className="w-4 h-4 text-pink-400" />
                  <span className="font-bold">GraphQL API Schema Definition</span>
                  <span className="text-slate-500">(schema.graphql)</span>
                </div>
                <button
                  onClick={() => handleCopyCode(activeService.graphqlSchema, "graphql")}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedField === "graphql" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "graphql" ? "Copied" : "Copy Schema"}</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-pink-300 leading-relaxed overflow-x-auto max-h-[450px]">
                <pre>{activeService.graphqlSchema}</pre>
              </div>
            </div>
          )}

          {/* Database Connection Subtab */}
          {activeSubTab === "database" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-4 h-4" />
                      Isolated Database Architecture
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      {activeService.databaseInfo.type}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-mono block">Database Identifier:</span>
                      <span className="text-slate-200 font-mono font-bold">{activeService.databaseInfo.databaseName}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-mono block">Connection Endpoint Example:</span>
                      <div className="bg-slate-900 border border-slate-800 rounded p-2 text-[11px] font-mono text-amber-300 break-all mt-1">
                        {activeService.databaseInfo.connectionStringExample}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-cyan-400" />
                      Managed Schema Tables / Collections
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                    {activeService.databaseInfo.tables.map((tbl, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800/80 p-2 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{tbl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connection Code Snippet */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 font-bold uppercase">Database Driver Connection Logic</span>
                  <button
                    onClick={() => handleCopyCode(activeService.databaseInfo.connectionCode, "dbcode")}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    {copiedField === "dbcode" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === "dbcode" ? "Copied" : "Copy Code"}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-amber-200/90 leading-relaxed overflow-x-auto max-h-[220px] bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <pre>{activeService.databaseInfo.connectionCode}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Interactive API Sandbox */}
          {activeSubTab === "sandbox" && (
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider">
                      Live Isolated Service Client Runner
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSandboxApiProtocol("grpc")}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
                        sandboxApiProtocol === "grpc"
                          ? "bg-purple-950 text-purple-300 border border-purple-800"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      gRPC RPC Client
                    </button>
                    <button
                      onClick={() => setSandboxApiProtocol("graphql")}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
                        sandboxApiProtocol === "graphql"
                          ? "bg-pink-950 text-pink-300 border border-pink-800"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      GraphQL Query Client
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 flex items-center space-x-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <span>localhost:{activeService.port} ({activeService.repositoryName})</span>
                  </div>

                  <button
                    onClick={handleRunSandboxTest}
                    disabled={sandboxIsExecuting}
                    className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {sandboxIsExecuting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Executing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Send Request</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sandbox Response Output */}
                {sandboxResponse && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          {sandboxResponse.status || "200 OK"}
                        </span>
                        <span className="text-slate-400">Response Payload</span>
                      </div>
                      {sandboxExecutionTime && (
                        <span className="text-slate-500 text-[11px]">
                          Latency: <strong className="text-cyan-400">{sandboxExecutionTime}ms</strong>
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[300px]">
                      <pre>{JSON.stringify(sandboxResponse, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
