import React, { useRef, useState } from "react";
import { ActiveTab, CustomVariables, SigmaRule, ProjectPackage } from "../types";
import { 
  ShieldCheck, 
  Code2, 
  Activity, 
  Database, 
  GitBranch, 
  Bot, 
  Lock, 
  Server,
  Zap,
  Download,
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  vars: CustomVariables;
  setVars: React.Dispatch<React.SetStateAction<CustomVariables>>;
  liveEps: number;
  rules: SigmaRule[];
  setRules: React.Dispatch<React.SetStateAction<SigmaRule[]>>;
  onImportPackage: (importedData: ProjectPackage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  vars,
  setVars,
  liveEps,
  rules,
  setRules,
  onImportPackage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "topology", label: "Pipeline Topology", icon: Activity },
    { id: "terraform", label: "Terraform Code", icon: Code2 },
    { id: "threat-detection", label: "Live Threat Engine", icon: ShieldCheck },
    { id: "data-lake", label: "Matano S3 Lake", icon: Database },
    { id: "cicd", label: "DevSecOps CI/CD", icon: GitBranch },
    { id: "ai-architect", label: "AI Architect", icon: Bot }
  ];

  const handleExportPackage = () => {
    const pkg: ProjectPackage = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      studio: "DevSecOps Security Pipeline Studio",
      pipelineConfig: vars,
      sigmaRules: rules,
      activeRuleId: rules[0]?.id
    };

    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `secops-pipeline-${vars.environment}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage({
      type: "success",
      text: `Exported pipeline configuration & ${rules.length} Sigma rules as unified JSON package!`
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as ProjectPackage;

        if (!parsed.pipelineConfig && !parsed.sigmaRules && !(parsed as any).rules) {
          throw new Error("Missing required pipelineConfig or sigmaRules sections in JSON package.");
        }

        onImportPackage(parsed);

        const importedRuleCount = parsed.sigmaRules?.length || (parsed as any).rules?.length || 0;
        setToastMessage({
          type: "success",
          text: `Restored environment: ${parsed.pipelineConfig?.projectName || vars.projectName} (${parsed.pipelineConfig?.environment || vars.environment}) with ${importedRuleCount} Sigma rules!`
        });
        setTimeout(() => setToastMessage(null), 5000);
      } catch (err: any) {
        setToastMessage({
          type: "error",
          text: `Import failed: ${err.message || "Invalid JSON package file format."}`
        });
        setTimeout(() => setToastMessage(null), 5000);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`px-4 py-2 border-b text-xs flex items-center justify-between font-mono animate-fade-in ${
          toastMessage.type === 'success' 
            ? 'bg-cyan-950/90 border-cyan-800 text-cyan-200' 
            : 'bg-red-950/90 border-red-800 text-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                DevSecOps Security Pipeline Studio
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Hybrid Architecture
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Decoupled Open-Source Telemetry: Amazon MSK (mTLS) → EKS Vector & Sigma → Matano S3 Iceberg
            </p>
          </div>
        </div>

        {/* Status Metrics Pills & Package Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Live EPS */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-slate-400">Throughput:</span>
            <span className="font-mono font-semibold text-amber-300">{liveEps.toLocaleString()} EPS</span>
          </div>

          {/* Security Gate */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/50 rounded-lg border border-emerald-700/50 text-emerald-300">
            <Lock className="w-3.5 h-3.5" />
            <span>Checkov:</span>
            <span className="font-semibold text-emerald-400">100% Passed</span>
          </div>

          {/* Region */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 text-slate-300">
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono">{vars.awsRegion}</span>
          </div>

          {/* Environment Selector */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(["dev", "staging", "prod"] as const).map((env) => (
              <button
                key={env}
                onClick={() => setVars((prev) => ({ ...prev, environment: env }))}
                className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  vars.environment === env
                    ? "bg-cyan-500 text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {env}
              </button>
            ))}
          </div>

          {/* Unified Project Export / Import Package Buttons */}
          <div className="flex items-center space-x-1 pl-1 border-l border-slate-800">
            <button
              onClick={handleExportPackage}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-600/90 hover:bg-blue-500 text-white font-medium rounded-lg transition-all border border-blue-500 shadow-sm cursor-pointer"
              title="Export complete pipeline config and Sigma rules as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Package</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium rounded-lg transition-all border border-slate-700 cursor-pointer"
              title="Import saved project JSON package to restore pipeline and rules"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Package</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <nav className="flex space-x-1 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

