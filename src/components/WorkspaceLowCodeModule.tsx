import React, { useState } from "react";
import { 
  LayoutGrid, 
  Workflow, 
  Globe, 
  MessageSquare, 
  Code2, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Search, 
  Layers, 
  Database, 
  Lock, 
  Video, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Monitor, 
  FileText, 
  Send, 
  RefreshCw, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Eye, 
  Edit3, 
  Sliders, 
  Sparkles, 
  Check, 
  X, 
  FileCode, 
  Terminal, 
  Cpu, 
  Hash, 
  Users, 
  Share2, 
  Radio, 
  Server, 
  Activity, 
  Settings,
  Shield,
  Tag
} from "lucide-react";

// Types for Low-Code Builder & CMS & Matrix Collaboration
export interface SchemaField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select' | 'user';
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

export interface CustomDataObject {
  id: string;
  name: string;
  key: string;
  description: string;
  fields: SchemaField[];
  recordsCount: number;
}

export interface WorkflowState {
  id: string;
  name: string;
  color: string;
  approverRole: string;
  nextStates: string[];
}

export interface CmsContentItem {
  id: string;
  slug: string;
  title: string;
  category: 'Article' | 'Landing Page' | 'Banner' | 'Documentation';
  status: 'Published' | 'Draft' | 'In Review';
  locale: 'en-US' | 'de-DE' | 'fr-FR';
  author: string;
  updatedAt: string;
  readCount: number;
}

export interface MatrixMessage {
  id: string;
  sender: string;
  role: string;
  content: string;
  timestamp: string;
  encrypted: boolean;
}

export const WorkspaceLowCodeModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lowcode' | 'cms' | 'collaboration' | 'architecture'>('lowcode');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // --- 1. LOW-CODE SCHEMA BUILDER STATE ---
  const [dataObjects, setDataObjects] = useState<CustomDataObject[]>([
    {
      id: "obj-01",
      name: "Expense Approval Request",
      key: "expense_request",
      description: "Enterprise employee travel & operational expense claim object.",
      fields: [
        { id: "f1", name: "employee_email", type: "string", required: true },
        { id: "f2", name: "amount_usd", type: "number", required: true },
        { id: "f3", name: "category", type: "select", required: true, options: ["Travel", "Hardware", "Software", "Meals"] },
        { id: "f4", name: "submission_date", type: "date", required: true },
        { id: "f5", name: "manager_approval", type: "boolean", required: false }
      ],
      recordsCount: 428
    },
    {
      id: "obj-02",
      name: "Security Vulnerability Ticket",
      key: "vuln_ticket",
      description: "Low-code threat remediation task tracked across engineering teams.",
      fields: [
        { id: "f10", name: "cve_id", type: "string", required: true },
        { id: "f11", name: "severity", type: "select", required: true, options: ["Low", "Medium", "High", "Critical"] },
        { id: "f12", name: "assigned_dev", type: "user", required: true },
        { id: "f13", name: "remediated", type: "boolean", required: true }
      ],
      recordsCount: 192
    }
  ]);

  const [selectedObjectId, setSelectedObjectId] = useState<string>("obj-01");

  // New field modal state
  const [newFieldName, setNewFieldName] = useState<string>('');
  const [newFieldType, setNewFieldType] = useState<SchemaField['type']>('string');
  const [newFieldRequired, setNewFieldRequired] = useState<boolean>(true);

  // Dynamic Form Submission Preview state
  const [formData, setFormData] = useState<Record<string, any>>({
    employee_email: "alex.morgan@acmebanking.com",
    amount_usd: 1450,
    category: "Software",
    submission_date: "2026-08-03",
    manager_approval: true
  });

  // State Machine Builder
  const [workflowStates, setWorkflowStates] = useState<WorkflowState[]>([
    { id: "st-1", name: "Draft", color: "bg-slate-700 text-slate-200", approverRole: "Applicant", nextStates: ["Submitted"] },
    { id: "st-2", name: "Submitted", color: "bg-amber-500/20 text-amber-300 border-amber-500/40", approverRole: "Team Lead", nextStates: ["Under Manager Review", "Rejected"] },
    { id: "st-3", name: "Under Manager Review", color: "bg-purple-500/20 text-purple-300 border-purple-500/40", approverRole: "Department Manager", nextStates: ["Approved", "Rejected"] },
    { id: "st-4", name: "Approved", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", approverRole: "Finance Administrator", nextStates: ["Archived"] },
    { id: "st-5", name: "Rejected", color: "bg-rose-500/20 text-rose-300 border-rose-500/40", approverRole: "Manager", nextStates: ["Draft"] }
  ]);

  // Zero-Code Script Runner State
  const [scriptInput, setScriptInput] = useState<string>(`// Volt MX / Domino Zero-Code Script Runner
function evaluateRule(record) {
  if (record.amount_usd > 10000) {
    return { status: 'ESCALATE_CFO', autoApproved: false, reason: 'Expense exceeds $10,000 threshold' };
  }
  if (record.category === 'Software' && record.amount_usd < 2000) {
    return { status: 'AUTO_APPROVE', autoApproved: true, reason: 'Pre-approved software budget tier' };
  }
  return { status: 'STANDARD_APPROVAL', autoApproved: false, reason: 'Standard review required' };
}`);
  const [scriptResult, setScriptResult] = useState<string | null>(null);

  // --- 2. DX / HEADLESS CMS STATE ---
  const [cmsArticles, setCmsArticles] = useState<CmsContentItem[]>([
    {
      id: "art-101",
      slug: "enterprise-sovereign-cloud-architecture-v2",
      title: "Building Air-Gapped Sovereign Cloud Infrastructure",
      category: "Article",
      status: "Published",
      locale: "en-US",
      author: "Elena Rostova",
      updatedAt: "10 mins ago",
      readCount: 1420
    },
    {
      id: "art-102",
      slug: "portal-home-hero-banner-q3",
      title: "Q3 Zero Trust Compliance Dashboard Launch",
      category: "Landing Page",
      status: "In Review",
      locale: "de-DE",
      author: "Marcus Chen",
      updatedAt: "1 hour ago",
      readCount: 890
    },
    {
      id: "art-103",
      slug: "opa-rego-policy-enforcement-guide",
      title: "Granular RBAC Policy Definition with Open Policy Agent",
      category: "Documentation",
      status: "Draft",
      locale: "fr-FR",
      author: "Alex Morgan",
      updatedAt: "Yesterday",
      readCount: 310
    }
  ]);

  // Cache Layer State
  const [cacheEntries, setCacheEntries] = useState<{ key: string; status: 'HIT' | 'MISS' | 'EXPIRED'; ttl: number; hits: number }[]>([
    { key: "dx:content:art-101:en-US", status: "HIT", ttl: 240, hits: 842 },
    { key: "dx:content:art-102:de-DE", status: "HIT", ttl: 115, hits: 390 },
    { key: "dx:route:portal_finance_v1", status: "HIT", ttl: 512, hits: 1950 },
    { key: "dx:cache:tenant_01_schema", status: "MISS", ttl: 0, hits: 12 }
  ]);

  // --- 3. SOVEREIGN COLLABORATION SUITE STATE ---
  const [selectedChannel, setSelectedChannel] = useState<string>("#secops-warroom:acme.org");
  const [matrixMessages, setMatrixMessages] = useState<MatrixMessage[]>([
    {
      id: "msg-01",
      sender: "Alex Morgan (Admin)",
      role: "SecOps Lead",
      content: "Initiating emergency vulnerability patch rollout for CVE-2026-8911 across Staging k8s cluster.",
      timestamp: "10:14 AM",
      encrypted: true
    },
    {
      id: "msg-02",
      sender: "Marcus Chen (Developer)",
      role: "DevOps Eng",
      content: "Checkov AST scanner passed with 0 critical findings. Ready to promote release tag v2.4.1.",
      timestamp: "10:16 AM",
      encrypted: true
    },
    {
      id: "msg-03",
      sender: "Elena Rostova (Auditor)",
      role: "Compliance Lead",
      content: "SOC2 Audit gate approved. Megolm E2EE session key rotated for channel integrity.",
      timestamp: "10:18 AM",
      encrypted: true
    }
  ]);

  const [newMessageText, setNewMessageText] = useState<string>('');

  // WebRTC Video Conf State
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [confParticipants] = useState([
    { name: "Alex Morgan", role: "SecOps Lead", videoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    { name: "Elena Rostova", role: "Compliance Auditor", videoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
    { name: "Marcus Chen", role: "Lead Architect", videoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }
  ]);

  // Add field handler
  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName) return;
    const formattedName = newFieldName.trim().toLowerCase().replace(/\s+/g, '_');
    
    setDataObjects(prev => prev.map(obj => {
      if (obj.id === selectedObjectId) {
        return {
          ...obj,
          fields: [
            ...obj.fields,
            { id: `f_${Date.now()}`, name: formattedName, type: newFieldType, required: newFieldRequired }
          ]
        };
      }
      return obj;
    }));

    setNewFieldName('');
    showToast(`Added field '${formattedName}' to schema object!`);
  };

  // Run Zero-Code Script
  const handleRunScript = () => {
    try {
      // Safely evaluate standard logic based on formData
      const isHighAmount = formData.amount_usd > 10000;
      const isPreapproved = formData.category === 'Software' && formData.amount_usd < 2000;

      const evalResult = {
        executionTimeMs: 1.4,
        status: isHighAmount ? 'ESCALATE_CFO' : (isPreapproved ? 'AUTO_APPROVED' : 'STANDARD_APPROVAL'),
        evaluatedRecord: formData,
        stateTransitions: [
          { from: 'Submitted', to: isHighAmount ? 'CFO_Review' : (isPreapproved ? 'Approved' : 'Under Manager Review') }
        ],
        logs: [
          `[LOG 10:20:01] Ingested record amount $${formData.amount_usd}`,
          `[LOG 10:20:01] Rule matched category '${formData.category}'`,
          `[LOG 10:20:02] Evaluation output: ${isPreapproved ? 'Auto-approved' : 'Requires approval'}`
        ]
      };

      setScriptResult(JSON.stringify(evalResult, null, 2));
      showToast("Zero-Code script evaluated successfully!");
    } catch (err) {
      showToast("Script evaluation failed.");
    }
  };

  // Handle Purge Cache
  const handlePurgeCache = () => {
    setCacheEntries(prev => prev.map(c => ({ ...c, status: 'MISS', ttl: 0 })));
    showToast("Flushed Redis DX content cache keys globally.");
  };

  // Send Matrix Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg: MatrixMessage = {
      id: `msg_${Date.now()}`,
      sender: "You (Current Operator)",
      role: "Security Engineer",
      content: newMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      encrypted: true
    };

    setMatrixMessages(prev => [...prev, newMsg]);
    setNewMessageText('');
    showToast("Message encrypted via Matrix Megolm E2EE & broadcast to room.");
  };

  const selectedObject = dataObjects.find(o => o.id === selectedObjectId) || dataObjects[0];

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
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" /> Pillar 2 Operational Service
              </span>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-0.5 rounded-md">
                Domino, Volt MX, DX & Sametime Suite
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-8 h-8 text-indigo-400" />
              Workspace, Low-Code Apps & Sovereign Collaboration
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Schema builder for custom data objects, drag-and-drop form rendering engine, workflow state machine builder, headless DX/CMS content portal, and Matrix E2EE sovereign collaboration suite.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex flex-col border-r border-slate-800 pr-4">
              <span className="text-slate-400 font-sans font-medium">Low-Code Engine</span>
              <span className="text-indigo-400 font-bold mt-0.5">Domino & Volt MX Ready</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-sans font-medium">Collaboration Protocol</span>
              <span className="text-emerald-400 font-bold mt-0.5">Matrix Megolm E2EE</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('lowcode')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'lowcode'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-indigo-300" />
            <span>Low-Code Visual Builder & Workflow Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cms'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Globe className="w-4 h-4 text-purple-300" />
            <span>Web Experience & Content Portal (DX / CMS)</span>
          </button>

          <button
            onClick={() => setActiveTab('collaboration')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'collaboration'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span>Sovereign Collaboration (Sametime / Matrix)</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-300" />
            <span>Microservice Repo & Contracts</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LOW-CODE VISUAL BUILDER */}
      {activeTab === 'lowcode' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Object Schema Explorer */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  Custom Schema Data Objects
                </h2>
                <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
                  Domino / Volt MX Schema
                </span>
              </div>

              {/* Object Selector */}
              <div className="space-y-2">
                {dataObjects.map(obj => (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjectId(obj.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedObjectId === obj.id
                        ? 'bg-slate-800 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-bold text-xs text-indigo-300">{obj.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">Key: {obj.key} • {obj.fields.length} Fields</div>
                    <p className="text-[11px] text-slate-400 mt-1">{obj.description}</p>
                  </button>
                ))}
              </div>

              {/* Add Field Form */}
              <form onSubmit={handleAddField} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 pt-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  Add Custom Field to Schema
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Field Name (snake_case):</label>
                    <input
                      type="text"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="e.g. approval_comments"
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Data Type:</label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 text-indigo-300 rounded-lg p-2 font-mono text-xs"
                    >
                      <option value="string">string (Text)</option>
                      <option value="number">number (Currency/Qty)</option>
                      <option value="boolean">boolean (Flag)</option>
                      <option value="date">date (Timestamp)</option>
                      <option value="select">select (Enum Dropdown)</option>
                      <option value="user">user (Role Reference)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Append Field to Object</span>
                </button>
              </form>
            </div>

            {/* Dynamic Drag & Drop Form Render Engine + Live Sandbox */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    Dynamic Form Rendering Engine & Live Schema Sandbox
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Object Target: {selectedObject.name} (`{selectedObject.key}`)</span>
                </div>

                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-mono font-bold">
                  Form State: Active Live Preview
                </span>
              </div>

              {/* Form Input Controls */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  {selectedObject.fields.map(field => (
                    <div key={field.id} className="space-y-1">
                      <label className="text-slate-300 font-bold flex items-center justify-between">
                        <span>{field.name}</span>
                        <span className="text-[10px] text-indigo-400 font-normal">{field.type}</span>
                      </label>

                      {field.type === 'select' ? (
                        <select
                          value={formData[field.name] || field.options?.[0]}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-indigo-300 p-2.5 rounded-lg text-xs"
                        >
                          {field.options?.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'boolean' ? (
                        <div className="flex items-center space-x-3 pt-2">
                          <input
                            type="checkbox"
                            checked={!!formData[field.name]}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                            className="w-4 h-4 accent-indigo-500 cursor-pointer"
                          />
                          <span className="text-slate-300 text-xs">Flag Enabled</span>
                        </div>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow State Machine Rules */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-purple-400" />
                  Workflow State Machine Transition Rules (Volt MX Engine)
                </h4>

                <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {workflowStates.map((st, i) => (
                    <React.Fragment key={st.id}>
                      <div className={`px-3 py-2 rounded-xl border text-xs font-mono space-y-1 ${st.color}`}>
                        <div className="font-bold text-white">{st.name}</div>
                        <div className="text-[10px] opacity-80">Role: {st.approverRole}</div>
                      </div>
                      {i < workflowStates.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Zero-Code Script Evaluation Sandbox */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Zero-Code Rule Evaluation Script Runner
                  </span>

                  <button
                    onClick={handleRunScript}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Evaluate Rule Script</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <textarea
                    value={scriptInput}
                    onChange={(e) => setScriptInput(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-900 border border-slate-800 text-indigo-300 p-3 rounded-lg font-mono text-[11px] focus:outline-none"
                  />
                  <pre className="bg-slate-900 border border-slate-800 text-emerald-300 p-3 rounded-lg overflow-x-auto text-[11px] max-h-52">
                    {scriptResult || '// Click "Evaluate Rule Script" to run live JS validation against form state.'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEB EXPERIENCE & CONTENT PORTAL (DX / CMS) */}
      {activeTab === 'cms' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Structured Content Assets */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    Headless DX Content Portal Assets & Dynamic Publishing
                  </h2>
                  <p className="text-xs text-slate-400">Structured CMS articles, localization tags, and role-based publishing lifecycle.</p>
                </div>

                <span className="text-xs text-indigo-300 font-mono font-bold bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
                  GraphQL Content Mesh Active
                </span>
              </div>

              {/* CMS Assets Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-900 uppercase text-[10px]">
                      <th className="py-3 px-4">Title & Slug</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Locale</th>
                      <th className="py-3 px-4">Publish Status</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4 text-right">Views</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {cmsArticles.map(art => (
                      <tr key={art.id} className="hover:bg-slate-900/50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white font-sans">{art.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">/{art.slug}</div>
                        </td>
                        <td className="py-3 px-4 text-purple-300 font-bold">{art.category}</td>
                        <td className="py-3 px-4 text-indigo-300">{art.locale}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                            art.status === 'Published'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : art.status === 'In Review'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {art.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{art.author}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400">{art.readCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Content Caching Layer Simulator */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  DX Content Cache Layer (Redis / CDN)
                </h2>

                <button
                  onClick={handlePurgeCache}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Purge Global Cache</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {cacheEntries.map((c, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 font-bold truncate max-w-xs">{c.key}</span>
                      <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                        c.status === 'HIT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                      <span>Hits: <strong className="text-indigo-300">{c.hits}</strong></span>
                      <span>TTL: <strong className="text-amber-300">{c.ttl}s remaining</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOVEREIGN COLLABORATION SUITE (SAMETIME / MATRIX) */}
      {activeTab === 'collaboration' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real-Time Matrix Chat Channel Engine */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    Sametime & Matrix Protocol Sovereign Chat Engine
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">Room: {selectedChannel} (Megolm E2EE Session Active)</span>
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 font-bold">Encrypted WebSockets Stream</span>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-64 overflow-y-auto space-y-3 font-mono text-xs">
                {matrixMessages.map(msg => (
                  <div key={msg.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        {msg.sender} <span className="text-[10px] text-slate-500 font-normal">({msg.role})</span>
                      </span>
                      <span className="text-slate-500 text-[10px]">{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-200 font-sans text-xs leading-relaxed">{msg.content}</p>
                  </div>
                ))}
              </div>

              {/* Send Input Form */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type an end-to-end encrypted Matrix protocol message..."
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send E2EE</span>
                </button>
              </form>
            </div>

            {/* Sovereign WebRTC Video Conference Mesh */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-400" />
                  Sovereign WebRTC Video Mesh
                </h2>
                <span className="text-[10px] text-purple-300 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  Air-Gapped Mesh
                </span>
              </div>

              {/* Participant Video Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {confParticipants.map((p, i) => (
                  <div key={i} className="relative h-28 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    <img src={p.videoUrl} alt={p.name} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-950/90 text-white text-[10px] font-mono rounded">
                      {p.name} ({p.role})
                    </div>
                  </div>
                ))}
              </div>

              {/* Conference Media Controls */}
              <div className="flex items-center justify-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                    isMicMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsCameraOff(!isCameraOff)}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                    isCameraOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {isCameraOff ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                    isScreenSharing ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MICROSERVICE REPO & CONTRACTS */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                Service Repo Architecture: `workspace-lowcode-service`
              </h2>
              <p className="text-xs text-slate-400">Isolated service repository with custom Dockerfile, gRPC/Protobuf contracts, and PostgreSQL/Redis persistence layer.</p>
            </div>

            <button
              onClick={() => handleCopyCode(`service WorkspaceService {\n  rpc CreateObject(CreateObjectRequest) returns (ObjectResponse);\n  rpc ExecuteRule(ExecuteRuleRequest) returns (RuleResult);\n}`, "gRPC Contract")}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>Copy Protobuf API Spec</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dockerfile Spec */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-indigo-300 font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                `services/workspace-lowcode/Dockerfile`
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
EXPOSE 3000
CMD ["node", "dist/server.cjs"]`}
              </pre>
            </div>

            {/* Protobuf Contract */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                `proto/workspace_v1.proto` (gRPC Contract)
              </span>
              <pre className="bg-slate-900 p-3 rounded-lg text-indigo-300 font-mono text-[11px] overflow-x-auto">
{`syntax = "proto3";
package workspace.v1;

service WorkspaceLowCodeService {
  rpc EvaluateWorkflowRule (RuleRequest) returns (RuleResponse);
  rpc IngestCmsAsset (CmsAssetRequest) returns (CmsAssetResponse);
  rpc BroadcastMatrixMessage (MatrixMessageRequest) returns (MatrixMessageResponse);
}

message RuleRequest {
  string object_key = 1;
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
