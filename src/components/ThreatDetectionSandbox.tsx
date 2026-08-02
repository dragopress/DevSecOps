import React, { useState, useEffect } from "react";
import { SigmaRule, SecurityLogEvent } from "../types";
import { defaultSigmaRules, sampleLogEvents } from "../data/mockSecurityData";
import { validateSigmaYaml } from "../utils/sigmaValidator";
import { AiSigmaGenerator } from "./AiSigmaGenerator";
import { 
  ShieldAlert, 
  Play, 
  Pause, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Code2, 
  Search, 
  Terminal,
  Activity,
  Trash2,
  RefreshCw,
  Check,
  Wand2,
  Info,
  ShieldCheck,
  XCircle,
  Sparkles
} from "lucide-react";

export const ThreatDetectionSandbox: React.FC = () => {
  const [rules, setRules] = useState<SigmaRule[]>(defaultSigmaRules);
  const [selectedRule, setSelectedRule] = useState<SigmaRule>(defaultSigmaRules[0]);
  const [ruleYaml, setRuleYaml] = useState<string>(defaultSigmaRules[0].detectionYaml);
  const [logs, setLogs] = useState<SecurityLogEvent[]>(sampleLogEvents);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<SecurityLogEvent | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [showLinterDetails, setShowLinterDetails] = useState<boolean>(true);
  const [showAiGenerator, setShowAiGenerator] = useState<boolean>(true);

  // Real-time Sigma Syntax Linting result
  const validationResult = validateSigmaYaml(ruleYaml);

  const handleAutoFixYaml = () => {
    let fixed = ruleYaml;
    if (!fixed.includes("status:")) {
      fixed = fixed.replace(/title:(.*)/, "title:$1\nstatus: production");
    }
    if (!fixed.includes("id:")) {
      const generatedUuid = "f" + Math.random().toString(16).substring(2, 10) + "-4000-8000-" + Date.now().toString(16).substring(0, 12);
      fixed = `id: ${generatedUuid}\n` + fixed;
    }
    if (!fixed.includes("level:")) {
      fixed += "\nlevel: high";
    }
    setRuleYaml(fixed);
  };

  // Sync editor when selecting rule preset
  useEffect(() => {
    setRuleYaml(selectedRule.detectionYaml);
  }, [selectedRule]);

  // Live stream generator simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const sources: SecurityLogEvent["source"][] = ["VPC Flow", "CloudTrail", "Zeek DNS", "CrowdStrike", "Syslog"];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      
      const newLog: SecurityLogEvent = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + Math.floor(Math.random() * 900 + 100),
        source: randomSource,
        logPayload: {
          src_ip: `10.100.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 250)}`,
          dst_ip: `10.100.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 250)}`,
          event_type: randomSource === "CloudTrail" ? "AttachUserPolicy" : randomSource === "Zeek DNS" ? "TXT_Query" : "NetworkFlow",
          user: Math.random() > 0.5 ? "admin-svc" : "root",
          bytes: Math.floor(Math.random() * 50000)
        },
        matchedRules: Math.random() > 0.6 ? [selectedRule.id] : [],
        severity: Math.random() > 0.7 ? "high" : Math.random() > 0.85 ? "critical" : "clean",
        processedBy: `Vector Worker #${Math.floor(Math.random() * 3) + 1} -> Confluent Sigma`
      };

      setLogs(prev => [newLog, ...prev.slice(0, 24)]);
    }, 2200);

    return () => clearInterval(interval);
  }, [isStreaming, selectedRule]);

  const handleTestRuleOnLog = () => {
    const testLog: SecurityLogEvent = {
      id: `eval-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }) + ".000",
      source: selectedRule.logsource.product === "zeek" ? "Zeek DNS" : "CloudTrail",
      logPayload: selectedRule.sampleLogMatch,
      matchedRules: [selectedRule.id],
      severity: selectedRule.level,
      processedBy: "Vector Node #1 -> Live Rule Evaluation"
    };
    setLogs(prev => [testLog, ...prev]);
  };

  const filteredLogs = logs.filter(l => filterSeverity === "all" || l.severity === filterSeverity);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Live Threat Detection Engine (Vector + Confluent Sigma)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Executes Sigma detection rules against real-time streaming telemetry in EKS processing workers before pushing alerts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAiGenerator(!showAiGenerator)}
            className={`px-3.5 py-2 rounded-lg border text-xs font-bold flex items-center space-x-2 transition-all shadow-xs ${
              showAiGenerator
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-600"
                : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>{showAiGenerator ? "Hide AI Generator" : "AI Rule Generator"}</span>
          </button>

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3.5 py-2 rounded-lg border text-xs font-bold flex items-center space-x-2 transition-all shadow-xs ${
              isStreaming 
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
            }`}
          >
            {isStreaming ? <Pause className="w-4 h-4 text-amber-600" /> : <Play className="w-4 h-4" />}
            <span>{isStreaming ? "Pause Stream" : "Resume Stream"}</span>
          </button>

          <button
            onClick={() => setLogs([])}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg transition-all shadow-xs"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Sigma Rule Generator Component */}
      {showAiGenerator && (
        <AiSigmaGenerator 
          onApplyDraftToEditor={(draftYaml) => {
            setRuleYaml(draftYaml);
          }} 
        />
      )}

      {/* Main Grid: Sigma Rule Editor & Live Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sigma Rule Management & YAML Editor */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-600" />
              Sigma Detection Rule Engine
            </h3>
            <span className="text-xs font-mono text-blue-700 font-bold">{rules.length} Rules Active</span>
          </div>

          {/* Preset Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">Select Sigma Rule Preset</label>
            <div className="space-y-1.5">
              {rules.map((rule) => (
                <button
                  key={rule.id}
                  onClick={() => setSelectedRule(rule)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    selectedRule.id === rule.id
                      ? "bg-blue-50 border-blue-200 text-blue-800 font-bold"
                      : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="truncate text-white font-medium">{rule.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{rule.logsource.product || "generic"} / {rule.logsource.category || "security"}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                    rule.level === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    rule.level === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {rule.level}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* YAML Editor & Real-Time SigmaValidator Box */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <div className="flex items-center space-x-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Sigma Rule Definition (YAML)</label>
                
                {/* Linter Status Badge */}
                {validationResult.isValid ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Sigma Valid
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-600" />
                    {validationResult.errors.length} Syntax Error{validationResult.errors.length > 1 ? "s" : ""}
                  </span>
                )}

                {validationResult.warnings.length > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    {validationResult.warnings.length} Warning{validationResult.warnings.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {(!validationResult.isValid || validationResult.warnings.length > 0) && (
                  <button
                    onClick={handleAutoFixYaml}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1"
                    title="Auto-insert missing required fields"
                  >
                    <Wand2 className="w-3 h-3 text-amber-600" />
                    <span>Auto-Fix</span>
                  </button>
                )}

                <button
                  onClick={handleTestRuleOnLog}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-xs"
                >
                  <Play className="w-3 h-3" />
                  <span>Inject Sample Match</span>
                </button>
              </div>
            </div>

            <textarea
              value={ruleYaml}
              onChange={(e) => setRuleYaml(e.target.value)}
              rows={12}
              className={`w-full bg-[#1F2937] border rounded-lg p-3 text-xs font-mono leading-relaxed transition-all focus:outline-none ${
                !validationResult.isValid 
                  ? "border-red-500/80 text-red-200 focus:border-red-500" 
                  : validationResult.warnings.length > 0
                  ? "border-amber-500/50 text-cyan-300 focus:border-amber-400"
                  : "border-slate-700 text-cyan-300 focus:border-blue-500"
              }`}
            />

            {/* SigmaValidator Interactive Linting Output Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-slate-200">SigmaValidator Real-Time Linter</span>
                </div>
                <button
                  onClick={() => setShowLinterDetails(!showLinterDetails)}
                  className="text-[10px] text-cyan-400 hover:underline font-mono"
                >
                  {showLinterDetails ? "Hide Diagnostics" : "Show Diagnostics"}
                </button>
              </div>

              {showLinterDetails && (
                <div className="space-y-1.5 pt-1">
                  {validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
                    <div className="p-2 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Schema passed: Valid top-level keys, logsource bindings, and detection condition pattern.</span>
                    </div>
                  )}

                  {validationResult.errors.map((err, idx) => (
                    <div key={`err-${idx}`} className="p-2 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-red-400">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>[ERROR] {err.field ? `Field '${err.field}'` : "YAML Structure"}: {err.message}</span>
                      </div>
                      {err.suggestion && (
                        <p className="text-[10px] text-red-300/80 pl-5 font-mono">💡 Suggestion: {err.suggestion}</p>
                      )}
                    </div>
                  ))}

                  {validationResult.warnings.map((warn, idx) => (
                    <div key={`warn-${idx}`} className="p-2 bg-amber-950/60 border border-amber-800/80 rounded-lg text-amber-200 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>[WARNING] {warn.field ? `Field '${warn.field}'` : "Best Practice"}: {warn.message}</span>
                      </div>
                      {warn.suggestion && (
                        <p className="text-[10px] text-amber-300/80 pl-5 font-mono">💡 Suggestion: {warn.suggestion}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Description:</span>
            <p>{selectedRule.description}</p>
          </div>
        </div>

        {/* Right: Live Telemetry Stream */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900">Live Ingested Telemetry Feed</h3>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex items-center space-x-1 text-xs">
              {["all", "critical", "high", "clean"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                    filterSeverity === sev
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Streaming Log List */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-mono">
                No telemetry logs matching filter criteria...
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    log.severity === "critical"
                      ? "bg-red-50/80 border-red-200 hover:bg-red-100/60"
                      : log.severity === "high"
                      ? "bg-amber-50/80 border-amber-200 hover:bg-amber-100/60"
                      : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-slate-500 text-[11px] font-semibold">{log.timestamp}</span>
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-white text-slate-700 border border-slate-200">
                        {log.source}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.severity === "critical" ? "bg-red-600 text-white" :
                      log.severity === "high" ? "bg-amber-500 text-slate-900" :
                      "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}>
                      {log.severity}
                    </span>
                  </div>

                  <div className="font-mono text-[11px] text-slate-800 truncate">
                    {JSON.stringify(log.logPayload)}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/80">
                    <span>{log.processedBy}</span>
                    {log.matchedRules.length > 0 && (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Matched: {selectedRule.title}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal for Clicked Log */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-600" />
                Telemetry Event Payload Inspector
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-600 hover:text-slate-900 text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-md"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div><span className="text-slate-400">Source:</span> <strong className="text-cyan-300">{selectedLog.source}</strong></div>
                <div><span className="text-slate-400">Timestamp:</span> <strong className="text-slate-200">{selectedLog.timestamp}</strong></div>
                <div><span className="text-slate-400">Severity:</span> <strong className="text-amber-400 uppercase">{selectedLog.severity}</strong></div>
                <div><span className="text-slate-400">Worker:</span> <strong className="text-slate-300">{selectedLog.processedBy}</strong></div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Parsed JSON Payload</label>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-cyan-200 text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.logPayload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
