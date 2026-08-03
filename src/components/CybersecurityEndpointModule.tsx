import React, { useState } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Laptop, 
  Terminal, 
  Code2, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  RefreshCw, 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Layers, 
  Cpu, 
  HardDrive, 
  Activity, 
  Sliders, 
  FileCode, 
  Check, 
  X, 
  Zap, 
  Lock, 
  Wrench, 
  Download, 
  Share2, 
  Server, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Radio,
  FileText
} from "lucide-react";

// Types for Cybersecurity AST & UEM
export interface SastFinding {
  id: string;
  filePath: string;
  line: number;
  owaspCategory: string;
  cweId: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  vulnerability: string;
  description: string;
  codeSnippet: string;
  remediation: string;
  status: 'Open' | 'In Review' | 'Mitigated' | 'False Positive';
}

export interface ScaDependency {
  id: string;
  packageName: string;
  installedVersion: string;
  fixedVersion: string;
  cveId: string;
  cvssScore: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  ecosystem: 'npm' | 'maven' | 'pypi' | 'cargo';
}

export interface EndpointDevice {
  id: string;
  hostname: string;
  ipAddress: string;
  os: string;
  agentVersion: string;
  status: 'Online' | 'Offline' | 'Pending Patch' | 'Non-Compliant';
  lastPing: string;
  cpuUsage: number;
  memoryUsage: number;
  complianceScore: number;
  serialNumber: string;
  edrStatus: 'CrowdStrike Active' | 'SentinelOne Active' | 'Defender Active';
}

export interface PatchPolicy {
  id: string;
  name: string;
  targetOs: string;
  rolloutRing: 'Ring 0 Canary' | 'Ring 1 Staging' | 'Ring 2 Production Global';
  autoRemediate: boolean;
  rebootBehavior: 'Deferred 24h' | 'Immediate' | 'Maintenance Window';
  active: boolean;
}

export interface RemediationTask {
  id: string;
  taskId: string;
  endpointHostname: string;
  vulnerabilityOrKb: string;
  action: string;
  status: 'Queued' | 'Executing' | 'Verifying' | 'Remediated' | 'Failed';
  timestamp: string;
}

export const CybersecurityEndpointModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ast' | 'uem' | 'inventory' | 'architecture'>('ast');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- 1. APPLICATION SECURITY SCANNER (AST & SAST) STATE ---
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [sastFindings, setSastFindings] = useState<SastFinding[]>([
    {
      id: "sast-01",
      filePath: "src/controllers/authController.ts",
      line: 42,
      owaspCategory: "A03:2021-Injection",
      cweId: "CWE-89",
      severity: "Critical",
      vulnerability: "Raw SQL Parameter Interpolation",
      description: "User input from req.body.username is directly concatenated into SQL string without parameterized query bindings.",
      codeSnippet: "const query = `SELECT * FROM users WHERE username = '${req.body.username}'`;",
      remediation: "const query = 'SELECT * FROM users WHERE username = $1'; await db.query(query, [req.body.username]);",
      status: "Open"
    },
    {
      id: "sast-02",
      filePath: "src/middleware/jwtValidator.ts",
      line: 18,
      owaspCategory: "A02:2021-Cryptographic Failures",
      cweId: "CWE-798",
      severity: "High",
      vulnerability: "Hardcoded HMAC Secret Key",
      description: "JWT signing key is hardcoded directly in source code rather than loaded from process.env.",
      codeSnippet: "const token = jwt.sign(payload, 'super_secret_enterprise_key_1234');",
      remediation: "const token = jwt.sign(payload, process.env.JWT_SIGNING_SECRET!);",
      status: "Open"
    },
    {
      id: "sast-03",
      filePath: "src/routes/fileExport.ts",
      line: 89,
      owaspCategory: "A01:2021-Broken Access Control",
      cweId: "CWE-22",
      severity: "High",
      vulnerability: "Path Traversal in File Reader",
      description: "Unsanitized user path param allows reading arbitrary files outside target export directory.",
      codeSnippet: "const content = fs.readFileSync(path.join('/var/exports', req.query.filename));",
      remediation: "const safePath = path.normalize(req.query.filename).replace(/^(\\.\\.[\\/\\\\])+/, '');",
      status: "In Review"
    }
  ]);

  const [scaDependencies, setScaDependencies] = useState<ScaDependency[]>([
    {
      id: "sca-01",
      packageName: "express-jwt",
      installedVersion: "6.0.0",
      fixedVersion: "7.7.5",
      cveId: "CVE-2026-39120",
      cvssScore: 9.8,
      severity: "Critical",
      ecosystem: "npm"
    },
    {
      id: "sca-02",
      packageName: "jsonwebtoken",
      installedVersion: "8.5.1",
      fixedVersion: "9.0.2",
      cveId: "CVE-2026-21840",
      cvssScore: 8.1,
      severity: "High",
      ecosystem: "npm"
    },
    {
      id: "sca-03",
      packageName: "axios",
      installedVersion: "0.21.1",
      fixedVersion: "1.7.4",
      cveId: "CVE-2026-10492",
      cvssScore: 7.5,
      severity: "High",
      ecosystem: "npm"
    }
  ]);

  // Run AST AST Scan Trigger
  const handleTriggerAstScan = () => {
    setIsScanning(true);
    showToast("Triggering Static Code Analysis (SAST) & Software Composition Analysis (SCA)...");

    setTimeout(() => {
      setIsScanning(false);
      showToast("AST Scan completed! 3 SAST findings & 3 SCA CVEs indexed.");
    }, 2000);
  };

  // Change finding status
  const handleTriageFinding = (id: string, newStatus: SastFinding['status']) => {
    setSastFindings(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
    showToast(`Updated finding ${id} status to ${newStatus}`);
  };

  // --- 2. UNIFIED ENDPOINT MANAGEMENT (UEM) STATE ---
  const [endpoints, setEndpoints] = useState<EndpointDevice[]>([
    {
      id: "ep-001",
      hostname: "NYC-SEC-LAP-042",
      ipAddress: "10.240.12.84",
      os: "Windows 11 Enterprise (23H2)",
      agentVersion: "v4.12.0-sec",
      status: "Online",
      lastPing: "Just now",
      cpuUsage: 14,
      memoryUsage: 48,
      complianceScore: 98,
      serialNumber: "SN-9948120-WIN",
      edrStatus: "CrowdStrike Active"
    },
    {
      id: "ep-002",
      hostname: "LON-DEV-MAC-109",
      ipAddress: "10.240.45.12",
      os: "macOS Sequoia 15.1",
      agentVersion: "v4.12.0-sec",
      status: "Pending Patch",
      lastPing: "2 mins ago",
      cpuUsage: 32,
      memoryUsage: 71,
      complianceScore: 78,
      serialNumber: "SN-MAC-M3-8812",
      edrStatus: "SentinelOne Active"
    },
    {
      id: "ep-003",
      hostname: "BER-OPS-LNX-004",
      ipAddress: "10.240.88.99",
      os: "Ubuntu 24.04.1 LTS",
      agentVersion: "v4.11.8-sec",
      status: "Non-Compliant",
      lastPing: "12 mins ago",
      cpuUsage: 88,
      memoryUsage: 91,
      complianceScore: 54,
      serialNumber: "SN-SVR-DELL-401",
      edrStatus: "Defender Active"
    }
  ]);

  const [patchPolicies, setPatchPolicies] = useState<PatchPolicy[]>([
    {
      id: "pol-01",
      name: "Critical OS Zero-Day Hotfix Enforcer",
      targetOs: "Windows 11 / macOS / Linux",
      rolloutRing: "Ring 0 Canary",
      autoRemediate: true,
      rebootBehavior: "Immediate",
      active: true
    },
    {
      id: "pol-02",
      name: "Monthly Workstation Cumulative Patch",
      targetOs: "Windows 11 Enterprise",
      rolloutRing: "Ring 2 Production Global",
      autoRemediate: true,
      rebootBehavior: "Maintenance Window",
      active: true
    }
  ]);

  const [remediationQueue, setRemediationQueue] = useState<RemediationTask[]>([
    {
      id: "task-01",
      taskId: "REM-8901",
      endpointHostname: "BER-OPS-LNX-004",
      vulnerabilityOrKb: "Linux Kernel CVE-2026-2101",
      action: "Apply live kernel patch & restart sys-daemon",
      status: "Queued",
      timestamp: "10:30 AM"
    },
    {
      id: "task-02",
      taskId: "REM-8902",
      endpointHostname: "LON-DEV-MAC-109",
      vulnerabilityOrKb: "Chrome Zero-Day V8 Sandbox Patch",
      action: "Upgrade Google Chrome to v128.0.6613.114",
      status: "Executing",
      timestamp: "10:28 AM"
    }
  ]);

  // Trigger Ping Fleet
  const handlePingFleet = () => {
    setEndpoints(prev => prev.map(ep => ({
      ...ep,
      lastPing: "Just now",
      cpuUsage: Math.floor(Math.random() * 40) + 10,
      memoryUsage: Math.floor(Math.random() * 30) + 40
    })));
    showToast("Sent real-time telemetry ping to all 3 registered endpoint agents!");
  };

  // Run Remediation Queue
  const handleRunRemediation = (taskId: string) => {
    setRemediationQueue(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Executing' } : t));
    showToast(`Executing automated remediation task ${taskId}...`);

    setTimeout(() => {
      setRemediationQueue(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Remediated' } : t));
      showToast(`Task ${taskId} completed successfully! Endpoint returned to compliant state.`);
    }, 2500);
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
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-rose-600 text-white font-bold text-xs rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" /> Pillar 3 Operational Service
              </span>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-0.5 rounded-md">
                Application Security & UEM Operations
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <ShieldAlert className="w-8 h-8 text-rose-400" />
              Cybersecurity & Unified Endpoint Management (UEM)
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              OWASP Top 10 Static Code Analyzer (SAST), Software Composition Analysis (SCA dependency scanner), UEM Endpoint telemetry agent, patch policy enforcer, and OS vulnerability auto-remediation task engine.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex flex-col border-r border-slate-800 pr-4">
              <span className="text-slate-400 font-sans font-medium">AST Security Score</span>
              <span className="text-amber-400 font-bold mt-0.5">88 / 100 Grade B+</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-sans font-medium">Fleet Compliant Rate</span>
              <span className="text-emerald-400 font-bold mt-0.5">92.4% Online</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('ast')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ast'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Code2 className="w-4 h-4 text-rose-300" />
            <span>Application Security Scanner (SAST / SCA)</span>
          </button>

          <button
            onClick={() => setActiveTab('uem')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'uem'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Laptop className="w-4 h-4 text-emerald-300" />
            <span>Unified Endpoint Management & Remediation</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <HardDrive className="w-4 h-4 text-purple-300" />
            <span>Live Hardware & Software Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-300" />
            <span>Microservice Repo & Contracts</span>
          </button>
        </div>
      </div>

      {/* TAB 1: APPLICATION SECURITY SCANNER (AST) */}
      {activeTab === 'ast' && (
        <div className="space-y-6">
          {/* Controls Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                AST Vulnerability Engine (SAST & SCA)
              </h2>
              <p className="text-xs text-slate-400">Scans source code repositories against OWASP Top 10 vulnerabilities & dependency CVE databases.</p>
            </div>

            <button
              onClick={handleTriggerAstScan}
              disabled={isScanning}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning AST Engine...' : 'Run Comprehensive AST Scan'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SAST Code Analyzer Findings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Static Application Security Testing (SAST)
                </h3>
                <span className="text-xs font-mono text-rose-300 bg-rose-950 px-2.5 py-0.5 rounded border border-rose-800">
                  {sastFindings.length} Open Findings
                </span>
              </div>

              <div className="space-y-3">
                {sastFindings.map(f => (
                  <div key={f.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-300 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        {f.vulnerability}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                        f.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {f.severity}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      File: <strong className="text-indigo-300">{f.filePath}:{f.line}</strong> • <span className="text-purple-300">{f.owaspCategory}</span> ({f.cweId})
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans">{f.description}</p>

                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-300 overflow-x-auto">
                      <div className="text-slate-500 mb-1">// Vulnerable Code:</div>
                      <code>{f.codeSnippet}</code>
                    </div>

                    <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/60 text-[10px] text-emerald-300 overflow-x-auto">
                      <div className="text-emerald-400 mb-1">// Recommended Remediation:</div>
                      <code>{f.remediation}</code>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500">Status: <strong className="text-white">{f.status}</strong></span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTriageFinding(f.id, 'Mitigated')}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[10px] font-bold rounded border border-emerald-500/40 cursor-pointer"
                        >
                          Mark Mitigated
                        </button>
                        <button
                          onClick={() => handleTriageFinding(f.id, 'False Positive')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded border border-slate-700 cursor-pointer"
                        >
                          False Positive
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SCA Dependency Scanner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Software Composition Analysis (SCA Dependencies)
                </h3>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-950 px-2.5 py-0.5 rounded border border-indigo-800">
                  CVE Feed Live
                </span>
              </div>

              <div className="space-y-3">
                {scaDependencies.map(dep => (
                  <div key={dep.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-300 font-bold">{dep.packageName} ({dep.ecosystem})</span>
                      <span className="px-2 py-0.5 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded font-bold">
                        CVSS {dep.cvssScore}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Vulnerability: <strong className="text-rose-400">{dep.cveId}</strong></span>
                      <span>Installed: <strong className="text-slate-300">{dep.installedVersion}</strong></span>
                    </div>

                    <div className="p-2.5 bg-indigo-950/40 border border-indigo-800/60 rounded-lg flex items-center justify-between">
                      <span className="text-[11px] text-indigo-200">Required Upgrade Fix:</span>
                      <span className="text-xs font-bold text-emerald-400">v{dep.fixedVersion}</span>
                    </div>

                    <button
                      onClick={() => showToast(`Triggered automated PR upgrade for ${dep.packageName} to v${dep.fixedVersion}`)}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Trigger Auto-Fix PR Upgrade</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UNIFIED ENDPOINT MANAGEMENT (UEM) */}
      {activeTab === 'uem' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-emerald-400" />
                UEM Endpoint Agent Telemetry & Automated Remediation
              </h2>
              <p className="text-xs text-slate-400">Monitors fleet devices across Windows, macOS, and Linux servers with live telemetry and auto-patch queues.</p>
            </div>

            <button
              onClick={handlePingFleet}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
            >
              <Radio className="w-4 h-4 text-emerald-200" />
              <span>Ping Fleet Telemetry</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Endpoint Devices List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Registered Endpoint Devices
                </h3>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
                  {endpoints.length} Active Agents
                </span>
              </div>

              <div className="space-y-3">
                {endpoints.map(ep => (
                  <div key={ep.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-indigo-400" />
                        {ep.hostname}
                      </span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        ep.status === 'Online'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : ep.status === 'Pending Patch'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {ep.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1">
                      <div>IP: <strong className="text-slate-200">{ep.ipAddress}</strong></div>
                      <div>OS: <strong className="text-indigo-300">{ep.os}</strong></div>
                      <div>Agent: <strong className="text-slate-300">{ep.agentVersion}</strong></div>
                      <div>EDR: <strong className="text-emerald-400">{ep.edrStatus}</strong></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">CPU Usage:</span>
                          <span className="text-indigo-300 font-bold">{ep.cpuUsage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full" style={{ width: `${ep.cpuUsage}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">RAM Usage:</span>
                          <span className="text-purple-300 font-bold">{ep.memoryUsage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full" style={{ width: `${ep.memoryUsage}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-Remediation Task Queue */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  Auto-Remediation Queue
                </h3>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  Task Engine
                </span>
              </div>

              <div className="space-y-3">
                {remediationQueue.map(task => (
                  <div key={task.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">{task.taskId}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        task.status === 'Remediated'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : task.status === 'Executing'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300">
                      Target: <strong className="text-white">{task.endpointHostname}</strong>
                    </div>

                    <p className="text-[11px] text-slate-400 font-sans">{task.action}</p>

                    {task.status !== 'Remediated' && (
                      <button
                        onClick={() => handleRunRemediation(task.id)}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Execute Patch Action</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE HARDWARE & SOFTWARE INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-purple-400" />
                Hardware & Enterprise Software Inventory
              </h2>
              <p className="text-xs text-slate-400">Detailed serial tracking, architecture specs, and security software license posture.</p>
            </div>

            <span className="text-xs font-mono text-purple-300 bg-purple-950 px-3 py-1 rounded-full border border-purple-800">
              Audit Compliance Verified
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900 uppercase text-[10px]">
                  <th className="py-3 px-4">Hostname & Serial</th>
                  <th className="py-3 px-4">OS Version</th>
                  <th className="py-3 px-4">CPU Architecture</th>
                  <th className="py-3 px-4">RAM / Storage</th>
                  <th className="py-3 px-4">EDR Agent</th>
                  <th className="py-3 px-4 text-right">Health Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {endpoints.map(ep => (
                  <tr key={ep.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{ep.hostname}</div>
                      <div className="text-[10px] text-slate-500">{ep.serialNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-indigo-300">{ep.os}</td>
                    <td className="py-3 px-4 text-slate-300">{ep.os.includes('MAC') ? 'Apple M3 Pro (ARM64)' : 'Intel Xeon / AMD x86_64'}</td>
                    <td className="py-3 px-4 text-slate-400">32 GB / 1 TB NVMe</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{ep.edrStatus}</td>
                    <td className="py-3 px-4 text-right font-bold text-indigo-400">{ep.complianceScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                Service Repo Architecture: `cybersecurity-endpoint-service`
              </h2>
              <p className="text-xs text-slate-400">Isolated service repository with custom Dockerfile, gRPC/Protobuf contracts, and PostgreSQL vulnerability database.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-indigo-300 font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                `services/cybersecurity-endpoint/Dockerfile`
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
EXPOSE 50059
CMD ["node", "dist/server.cjs"]`}
              </pre>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                `proto/cybersecurity_v1.proto` (gRPC Contract)
              </span>
              <pre className="bg-slate-900 p-3 rounded-lg text-indigo-300 font-mono text-[11px] overflow-x-auto">
{`syntax = "proto3";
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
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
