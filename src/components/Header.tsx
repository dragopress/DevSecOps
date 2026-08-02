import React from "react";
import { ActiveTab, CustomVariables } from "../types";
import { 
  ShieldCheck, 
  Code2, 
  Activity, 
  Database, 
  GitBranch, 
  Bot, 
  Lock, 
  Server,
  Zap
} from "lucide-react";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  vars: CustomVariables;
  setVars: React.Dispatch<React.SetStateAction<CustomVariables>>;
  liveEps: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  vars,
  setVars,
  liveEps
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "topology", label: "Pipeline Topology", icon: Activity },
    { id: "terraform", label: "Terraform Code", icon: Code2 },
    { id: "threat-detection", label: "Live Threat Engine", icon: ShieldCheck },
    { id: "data-lake", label: "Matano S3 Lake", icon: Database },
    { id: "cicd", label: "DevSecOps CI/CD", icon: GitBranch },
    { id: "ai-architect", label: "AI Architect", icon: Bot }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        {/* Status Metrics Pills */}
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
                className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider transition-all ${
                  vars.environment === env
                    ? "bg-cyan-500 text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {env}
              </button>
            ))}
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
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
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
