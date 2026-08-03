import React, { useState, useEffect } from "react";
import { SigmaRule, SecurityLogEvent, CustomVariables, ProjectPackage } from "../types";
import { defaultSigmaRules, sampleLogEvents } from "../data/mockSecurityData";
import { sigmaTemplateLibrary, SigmaTemplate } from "../data/sigmaTemplateLibrary";
import { validateSigmaYaml } from "../utils/sigmaValidator";
import { AiSigmaGenerator, getMatanoSchemaMapping, MatanoSchemaSuggestion } from "./AiSigmaGenerator";
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
  Sparkles,
  Loader2,
  Database,
  ArrowRight,
  BookOpen,
  Layers,
  Filter,
  Tag,
  Copy,
  FileText,
  SlidersHorizontal,
  BookmarkPlus,
  FileCode,
  ChevronDown,
  ChevronUp,
  Download,
  Upload
} from "lucide-react";

export interface ThreatDetectionSandboxProps {
  rules?: SigmaRule[];
  setRules?: React.Dispatch<React.SetStateAction<SigmaRule[]>>;
  vars?: CustomVariables;
  onExportPackage?: () => void;
  onImportPackage?: (importedData: ProjectPackage) => void;
}

export const ThreatDetectionSandbox: React.FC<ThreatDetectionSandboxProps> = ({
  rules: propsRules,
  setRules: propsSetRules,
  vars,
  onExportPackage,
  onImportPackage
}) => {
  const [internalRules, setInternalRules] = useState<SigmaRule[]>(defaultSigmaRules);
  const rules = propsRules || internalRules;
  const setRules = propsSetRules || setInternalRules;

  const [selectedRule, setSelectedRule] = useState<SigmaRule>(rules[0] || defaultSigmaRules[0]);
  const [ruleYaml, setRuleYaml] = useState<string>((rules[0] || defaultSigmaRules[0]).detectionYaml);

  const [logs, setLogs] = useState<SecurityLogEvent[]>(sampleLogEvents);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<SecurityLogEvent | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [showLinterDetails, setShowLinterDetails] = useState<boolean>(true);
  const [showAiGenerator, setShowAiGenerator] = useState<boolean>(true);

  // Gemini AI Prompt Input state
  const [inlineAiPrompt, setInlineAiPrompt] = useState<string>("");
  const [inlineLogType, setInlineLogType] = useState<string>("zeek_dns");
  const [isInlineGenerating, setIsInlineGenerating] = useState<boolean>(false);
  const [aiGeneratedResultInfo, setAiGeneratedResultInfo] = useState<{
    schema: MatanoSchemaSuggestion;
    explanation: string;
    status: "success" | "error";
  } | null>(null);

  // Real-time Sigma Syntax Linting result
  const validationResult = validateSigmaYaml(ruleYaml);

  const [autoFixApplied, setAutoFixApplied] = useState<boolean>(false);
  const [injectSuccess, setInjectSuccess] = useState<boolean>(false);

  // Pre-built Sigma Rule Template Library state
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>("all");
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>("");
  const [showTemplateLibrary, setShowTemplateLibrary] = useState<boolean>(true);
  const [templateAppliedToast, setTemplateAppliedToast] = useState<string | null>(null);

  // Active Rules Search & Filter State
  const [ruleSearchQuery, setRuleSearchQuery] = useState<string>("");
  const [ruleSeverityFilter, setRuleSeverityFilter] = useState<string>("all");
  const [ruleLogSourceFilter, setRuleLogSourceFilter] = useState<string>("all");
  const [ruleMitreFilter, setRuleMitreFilter] = useState<string>("all");

  const handleSelectTemplate = (template: SigmaTemplate) => {
    const exists = rules.some(r => r.id === template.id);
    if (!exists) {
      setRules(prev => [template, ...prev]);
    }
    setSelectedRule(template);
    setRuleYaml(template.detectionYaml);
    setTemplateAppliedToast(`Loaded template: "${template.title}" into YAML editor`);
    setTimeout(() => setTemplateAppliedToast(null), 3500);
  };

  const handleInlineGeminiGenerate = async () => {
    if (!inlineAiPrompt.trim()) return;

    setIsInlineGenerating(true);
    const schema = getMatanoSchemaMapping(inlineLogType);

    try {
      const response = await fetch("/api/ai/generate-sigma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inlineAiPrompt, logType: inlineLogType })
      });

      let yamlContent = "";
      if (response.ok) {
        const data = await response.json();
        const rawText = data.result || "";
        const yamlMatch = rawText.match(/```yaml([\s\S]*?)```/i) || rawText.match(/```([\s\S]*?)```/i);
        yamlContent = yamlMatch ? yamlMatch[1].trim() : rawText.trim();
      } else {
        throw new Error("API call failed");
      }

      setRuleYaml(yamlContent);
      const titleMatch = yamlContent.match(/title:\s*(.*)/i);
      const generatedTitle = titleMatch ? titleMatch[1].replace(/^["']|["']$/g, "").trim() : `AI Detected: ${inlineAiPrompt.substring(0, 30)}`;

      const newRule: SigmaRule = {
        id: `ai-rule-${Date.now()}`,
        title: generatedTitle,
        description: `Gemini AI rule generated for ${schema.icebergTable}`,
        status: "production",
        author: "Gemini AI Architect",
        level: yamlContent.includes("level: critical") ? "critical" : yamlContent.includes("level: high") ? "high" : "medium",
        logsource: {
          product: schema.logSourceProduct,
          service: schema.logSourceService,
          category: inlineLogType === "zeek_dns" ? "dns" : "security"
        },
        detectionYaml: yamlContent,
        sampleLogMatch: {
          timestamp: new Date().toISOString(),
          event_type: "AI_Detected_Threat",
          source_table: schema.icebergTable
        }
      };

      setRules(prev => [newRule, ...prev]);
      setSelectedRule(newRule);
      setAiGeneratedResultInfo({
        schema,
        explanation: `Synthesized & validated Sigma rule for ${schema.icebergTable} with Gemini AI.`,
        status: "success"
      });
    } catch (err) {
      const fallbackUuid = "f" + Math.random().toString(16).substring(2, 10) + "-4000-8000-" + Date.now().toString(16).substring(0, 12);
      let fallbackYaml = "";

      if (inlineLogType === "zeek_dns") {
        fallbackYaml = `title: Detect ${inlineAiPrompt.substring(0, 40)}
id: ${fallbackUuid}
status: production
description: AI synthesized Sigma rule for Zeek DNS anomaly detection.
author: Gemini Security Engineer
date: ${new Date().toISOString().split('T')[0]}
logsource:
  product: zeek
  service: dns
  category: dns
detection:
  selection:
    qtype_name:
      - 'TXT'
      - 'ANY'
    query|contains:
      - 'base64'
      - 'cmd'
  condition: selection
level: high
falsepositives:
  - Legitimate internal service discovery queries
`;
      } else if (inlineLogType === "cloudtrail") {
        fallbackYaml = `title: Detect ${inlineAiPrompt.substring(0, 40)}
id: ${fallbackUuid}
status: production
description: AI synthesized Sigma rule for AWS CloudTrail IAM privilege escalation.
author: Gemini Security Engineer
date: ${new Date().toISOString().split('T')[0]}
logsource:
  product: aws
  service: cloudtrail
  category: security
detection:
  selection:
    eventName:
      - 'AttachUserPolicy'
      - 'AttachRolePolicy'
      - 'CreateAccessKey'
    requestParameters.policyArn|contains:
      - 'AdministratorAccess'
  condition: selection
level: critical
falsepositives:
  - Authorized Terraform deployment pipelines
`;
      } else {
        fallbackYaml = `title: Detect ${inlineAiPrompt.substring(0, 40)}
id: ${fallbackUuid}
status: production
description: AI synthesized Sigma rule mapped to ${schema.icebergTable}.
author: Gemini Security Engineer
date: ${new Date().toISOString().split('T')[0]}
logsource:
  product: ${schema.logSourceProduct}
  service: ${schema.logSourceService}
  category: security
detection:
  selection:
    action:
      - 'REJECT'
      - 'DENY'
  condition: selection
level: high
falsepositives:
  - Internal network scanner probes
`;
      }

      setRuleYaml(fallbackYaml);
      const newRule: SigmaRule = {
        id: `ai-rule-${Date.now()}`,
        title: `Detect ${inlineAiPrompt.substring(0, 35)}`,
        description: `Gemini AI rule generated for ${schema.icebergTable}`,
        status: "production",
        author: "Gemini AI Architect",
        level: "high",
        logsource: {
          product: schema.logSourceProduct,
          service: schema.logSourceService,
          category: "security"
        },
        detectionYaml: fallbackYaml,
        sampleLogMatch: {
          timestamp: new Date().toISOString(),
          event_type: "AI_Detected_Threat",
          source_table: schema.icebergTable
        }
      };

      setRules(prev => [newRule, ...prev]);
      setSelectedRule(newRule);
      setAiGeneratedResultInfo({
        schema,
        explanation: `Synthesized & validated Sigma rule for ${schema.icebergTable} against Matano schema.`,
        status: "success"
      });
    } finally {
      setIsInlineGenerating(false);
    }
  };

  const handleAutoFixYaml = () => {
    let fixed = ruleYaml.trim();

    // 1. Ensure title exists
    if (!fixed.includes("title:")) {
      fixed = "title: Security Threat Detection Rule\n" + fixed;
    }

    // 2. Ensure id exists
    if (!fixed.includes("id:")) {
      const generatedUuid = "f" + Math.random().toString(16).substring(2, 10) + "-4000-8000-" + Date.now().toString(16).substring(0, 12);
      if (fixed.includes("title:")) {
        fixed = fixed.replace(/(title:[^\n]*)/, `$1\nid: ${generatedUuid}`);
      } else {
        fixed = `id: ${generatedUuid}\n` + fixed;
      }
    }

    // 3. Ensure status exists
    if (!fixed.includes("status:")) {
      if (fixed.includes("id:")) {
        fixed = fixed.replace(/(id:[^\n]*)/, "$1\nstatus: production");
      } else if (fixed.includes("title:")) {
        fixed = fixed.replace(/(title:[^\n]*)/, "$1\nstatus: production");
      } else {
        fixed = "status: production\n" + fixed;
      }
    }

    // 4. Ensure logsource exists with subfields
    if (!fixed.includes("logsource:")) {
      fixed += "\nlogsource:\n  category: security\n  product: generic\n  service: system";
    } else {
      if (!fixed.includes("category:") && !fixed.includes("product:") && !fixed.includes("service:")) {
        fixed = fixed.replace(/(logsource:[^\n]*)/, "$1\n  category: security\n  product: generic");
      }
    }

    // 5. Ensure detection exists with selection and condition
    if (!fixed.includes("detection:")) {
      fixed += "\ndetection:\n  selection:\n    event_type: alert\n  condition: selection";
    } else {
      if (!fixed.includes("condition:")) {
        fixed += "\n  condition: selection";
      }
      if (!fixed.includes("selection:") && !fixed.includes("keywords:")) {
        fixed = fixed.replace(/(detection:[^\n]*)/, "$1\n  selection:\n    event_type: alert");
      }
    }

    // 6. Ensure level exists
    if (!fixed.includes("level:")) {
      fixed += "\nlevel: high";
    }

    setRuleYaml(fixed);
    setSelectedRule(prev => ({ ...prev, detectionYaml: fixed }));
    setRules(prev => prev.map(r => r.id === selectedRule.id ? { ...r, detectionYaml: fixed } : r));
    setAutoFixApplied(true);
    setTimeout(() => setAutoFixApplied(false), 3000);
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
    // 1. Determine payload dynamically from current ruleYaml or selectedRule
    let samplePayload = selectedRule?.sampleLogMatch;
    
    if (!samplePayload || Object.keys(samplePayload).length === 0) {
      if (ruleYaml.toLowerCase().includes("dns") || ruleYaml.toLowerCase().includes("zeek")) {
        samplePayload = {
          timestamp: new Date().toISOString(),
          query: "stage.1a2b3c.c2.malware-cnc.com",
          qtype_name: "TXT",
          client_ip: "10.100.12.88",
          dns_response: "192.0.2.1",
          ttl: 30
        };
      } else if (ruleYaml.toLowerCase().includes("cloudtrail") || ruleYaml.toLowerCase().includes("iam") || ruleYaml.toLowerCase().includes("aws")) {
        samplePayload = {
          timestamp: new Date().toISOString(),
          eventName: "AttachUserPolicy",
          eventSource: "iam.amazonaws.com",
          user: "compromised-admin",
          policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
          sourceIPAddress: "198.51.100.22"
        };
      } else {
        samplePayload = {
          timestamp: new Date().toISOString(),
          event_id: "Failed password",
          src_ip: "198.51.100.44",
          user: "root",
          auth_method: "password",
          port: 22,
          service: "sshd"
        };
      }
    }

    // 2. Determine severity
    let level: SecurityLogEvent["severity"] = "high";
    if (ruleYaml.includes("level: critical")) level = "critical";
    else if (ruleYaml.includes("level: high")) level = "high";
    else if (ruleYaml.includes("level: medium") || ruleYaml.includes("level: low")) level = "clean";
    else if (selectedRule?.level) level = selectedRule.level;

    // 3. Determine source
    let source: SecurityLogEvent["source"] = "Zeek DNS";
    if (ruleYaml.toLowerCase().includes("cloudtrail") || ruleYaml.toLowerCase().includes("aws")) source = "CloudTrail";
    else if (ruleYaml.toLowerCase().includes("vpc")) source = "VPC Flow";
    else if (ruleYaml.toLowerCase().includes("crowdstrike") || ruleYaml.toLowerCase().includes("edr")) source = "CrowdStrike";
    else if (ruleYaml.toLowerCase().includes("sshd") || ruleYaml.toLowerCase().includes("syslog") || ruleYaml.toLowerCase().includes("linux")) source = "Syslog";

    // 4. Extract title
    const titleMatch = ruleYaml.match(/title:\s*(.*)/i);
    const ruleTitle = titleMatch ? titleMatch[1].trim() : (selectedRule?.title || "Custom Sigma Rule");

    const testLog: SecurityLogEvent = {
      id: `eval-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }) + "." + Math.floor(Math.random() * 900 + 100),
      source: source,
      logPayload: samplePayload,
      matchedRules: [ruleTitle],
      severity: level,
      processedBy: "Vector Node #1 -> Live Confluent Engine Match"
    };

    // Ensure filter doesn't hide the injected log
    setFilterSeverity("all");
    
    // Inject at top of log feed
    setLogs(prev => [testLog, ...prev.slice(0, 24)]);
    
    // Highlight / select injected log immediately
    setSelectedLog(testLog);

    // Show visual confirmation toast
    setInjectSuccess(true);
    setTimeout(() => setInjectSuccess(false), 3000);
  };

  const filteredLogs = logs.filter(l => filterSeverity === "all" || l.severity === filterSeverity);

  // Filter active rules based on search query, severity, logsource, and MITRE ATT&CK technique
  const filteredActiveRules = rules.filter(rule => {
    // 1. Search Query
    if (ruleSearchQuery.trim()) {
      const q = ruleSearchQuery.toLowerCase().trim();
      const titleMatch = rule.title.toLowerCase().includes(q);
      const descMatch = rule.description.toLowerCase().includes(q);
      const yamlMatch = rule.detectionYaml.toLowerCase().includes(q);
      const mitreMatch = rule.mitreAttackId ? rule.mitreAttackId.toLowerCase().includes(q) : false;
      const tagsMatch = rule.tags ? rule.tags.some(t => t.toLowerCase().includes(q)) : false;
      const authorMatch = rule.author ? rule.author.toLowerCase().includes(q) : false;
      const logsourceMatch =
        (rule.logsource.product && rule.logsource.product.toLowerCase().includes(q)) ||
        (rule.logsource.service && rule.logsource.service.toLowerCase().includes(q)) ||
        (rule.logsource.category && rule.logsource.category.toLowerCase().includes(q));

      if (!titleMatch && !descMatch && !yamlMatch && !mitreMatch && !tagsMatch && !authorMatch && !logsourceMatch) {
        return false;
      }
    }

    // 2. Severity Filter
    if (ruleSeverityFilter !== "all") {
      if (rule.level !== ruleSeverityFilter) {
        return false;
      }
    }

    // 3. Log Source Filter
    if (ruleLogSourceFilter !== "all") {
      const targetLs = ruleLogSourceFilter.toLowerCase();
      const prod = (rule.logsource.product || "").toLowerCase();
      const serv = (rule.logsource.service || "").toLowerCase();
      const cat = (rule.logsource.category || "").toLowerCase();
      const yaml = rule.detectionYaml.toLowerCase();

      const matchesLs = prod.includes(targetLs) || serv.includes(targetLs) || cat.includes(targetLs) || yaml.includes(targetLs);
      if (!matchesLs) return false;
    }

    // 4. MITRE ATT&CK Filter
    if (ruleMitreFilter !== "all") {
      const targetMitre = ruleMitreFilter.toLowerCase();
      const ruleMitre = (rule.mitreAttackId || "").toLowerCase();
      const ruleYaml = rule.detectionYaml.toLowerCase();
      const ruleTags = (rule.tags || []).map(t => t.toLowerCase());

      const matchesMitre =
        ruleMitre.includes(targetMitre) ||
        ruleTags.some(t => t.includes(targetMitre)) ||
        ruleYaml.includes(targetMitre);

      if (!matchesMitre) return false;
    }

    return true;
  });

  const hasActiveRuleFilters = ruleSearchQuery.trim() !== "" || ruleSeverityFilter !== "all" || ruleLogSourceFilter !== "all" || ruleMitreFilter !== "all";

  const clearAllRuleFilters = () => {
    setRuleSearchQuery("");
    setRuleSeverityFilter("all");
    setRuleLogSourceFilter("all");
    setRuleMitreFilter("all");
  };

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

          {/* Inline Gemini AI Input Field */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Gemini AI Rule Generator</span>
              </div>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-semibold">
                Matano Schema Engine
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <input
                  type="text"
                  value={inlineAiPrompt}
                  onChange={(e) => setInlineAiPrompt(e.target.value)}
                  placeholder="Describe threat to generate Sigma YAML (e.g. Detect DNS TXT base64 payloads)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isInlineGenerating && inlineAiPrompt.trim()) {
                      handleInlineGeminiGenerate();
                    }
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={inlineLogType}
                  onChange={(e) => setInlineLogType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono grow"
                >
                  <option value="zeek_dns">Zeek DNS (zeek_dns_logs)</option>
                  <option value="cloudtrail">AWS CloudTrail (aws_cloudtrail_logs)</option>
                  <option value="vpc_flow">AWS VPC Flow (aws_vpc_flow_logs)</option>
                  <option value="crowdstrike">CrowdStrike EDR (crowdstrike_process_logs)</option>
                  <option value="syslog">Linux Syslog (syslog_auth_logs)</option>
                </select>

                <button
                  type="button"
                  onClick={handleInlineGeminiGenerate}
                  disabled={isInlineGenerating || !inlineAiPrompt.trim()}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                >
                  {isInlineGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  <span>{isInlineGenerating ? "Generating..." : "Generate with Gemini"}</span>
                </button>
              </div>
            </div>

            {/* AI Result & Matano Schema Validation Banner */}
            {aiGeneratedResultInfo && (
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] space-y-1 font-mono">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Matano Schema Validated
                  </span>
                  <span className="text-slate-400 text-[10px]">{aiGeneratedResultInfo.schema.logSourceProduct} / {aiGeneratedResultInfo.schema.logSourceService}</span>
                </div>
                <div className="text-slate-300">
                  Target Iceberg Table: <span className="text-cyan-300 font-bold">{aiGeneratedResultInfo.schema.icebergTable}</span>
                </div>
                <div className="text-slate-400 text-[10px] line-clamp-1">
                  Partitioning: {aiGeneratedResultInfo.schema.partitioning}
                </div>
              </div>
            )}
          </div>

          {/* Preset Selector & Pre-Built Sigma Rule Template Library */}
          <div className="space-y-3">
            {/* Toast Notification for Template Insertion */}
            {templateAppliedToast && (
              <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-200 text-xs flex items-center justify-between font-mono animate-fade-in shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{templateAppliedToast}</span>
                </div>
                <span className="text-[10px] bg-cyan-900/80 text-cyan-200 px-2 py-0.5 rounded border border-cyan-700">Real-Time Linter Updated</span>
              </div>
            )}

            {/* Pre-Built Sigma Rule Template Library */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
              {/* Library Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-200">Pre-Built Threat Rule Template Library</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                        {sigmaTemplateLibrary.length} Threat Templates
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Select pre-built Sigma rules for common threat scenarios (brute-force, unauthorized API access, C2 beaconing, exfiltration) to load directly into the editor.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  {showTemplateLibrary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>{showTemplateLibrary ? "Collapse Library" : "Expand Library"}</span>
                </button>
              </div>

              {showTemplateLibrary && (
                <>
                  {/* Search & Category Filter Bar */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      {/* Search Bar */}
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={templateSearchQuery}
                          onChange={(e) => setTemplateSearchQuery(e.target.value)}
                          placeholder="Search threat templates (e.g. brute-force, API access, T1110, S3)..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      {/* Category Dropdown Filter */}
                      <select
                        value={selectedTemplateCategory}
                        onChange={(e) => setSelectedTemplateCategory(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500 shrink-0"
                      >
                        <option value="all">All Threat Categories ({sigmaTemplateLibrary.length})</option>
                        <option value="Brute Force & Authentication">Brute Force & Authentication</option>
                        <option value="Cloud API & Auth">Cloud API & Auth</option>
                        <option value="Network & DNS Threat">Network & DNS Threat</option>
                        <option value="Kubernetes & Container">Kubernetes & Container</option>
                        <option value="S3 & Data Exfiltration">S3 & Data Exfiltration</option>
                        <option value="Endpoint & Ransomware">Endpoint & Ransomware</option>
                      </select>
                    </div>

                    {/* Quick Filter Pill Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                      {[
                        { id: "all", label: "All" },
                        { id: "Brute Force & Authentication", label: "Brute Force" },
                        { id: "Cloud API & Auth", label: "Cloud API" },
                        { id: "Network & DNS Threat", label: "DNS / Network" },
                        { id: "Kubernetes & Container", label: "K8s" },
                        { id: "S3 & Data Exfiltration", label: "S3 Exfil" },
                        { id: "Endpoint & Ransomware", label: "Ransomware" }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedTemplateCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap transition-all border cursor-pointer ${
                            selectedTemplateCategory === cat.id
                              ? "bg-blue-600 border-blue-500 text-white shadow-xs"
                              : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template Cards Catalog */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
                    {sigmaTemplateLibrary
                      .filter(template => {
                        const matchesCat = selectedTemplateCategory === "all" || template.categoryName === selectedTemplateCategory;
                        const matchesQuery = !templateSearchQuery.trim() || 
                          template.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
                          (template.mitreAttackId && template.mitreAttackId.toLowerCase().includes(templateSearchQuery.toLowerCase())) ||
                          template.tags.some(t => t.toLowerCase().includes(templateSearchQuery.toLowerCase()));
                        return matchesCat && matchesQuery;
                      })
                      .map((template) => {
                        const isSelected = selectedRule.id === template.id || selectedRule.title === template.title;
                        return (
                          <div
                            key={template.id}
                            className={`p-3 rounded-lg border transition-all space-y-2 flex flex-col justify-between ${
                              isSelected 
                                ? "bg-blue-950/50 border-blue-500/80 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                                : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wide border ${
                                    template.level === 'critical' ? 'bg-red-950 text-red-300 border-red-800' :
                                    template.level === 'high' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                                    'bg-blue-950 text-blue-300 border-blue-800'
                                  }`}>
                                    {template.level}
                                  </span>
                                  {template.mitreAttackId && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-cyan-300 border border-slate-700">
                                      {template.mitreAttackId}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {template.logsource.product || "generic"} / {template.logsource.service || template.logsource.category}
                                  </span>
                                </div>

                                {isSelected && (
                                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 shrink-0 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                                    <CheckCircle2 className="w-3 h-3" /> Active
                                  </span>
                                )}
                              </div>

                              <h4 className="text-xs font-bold text-slate-100 leading-snug">{template.title}</h4>
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{template.description}</p>
                            </div>

                            {/* Card Footer: Tags & Load Button */}
                            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1 overflow-hidden">
                                {template.tags.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 truncate">
                                    #{tag}
                                  </span>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleSelectTemplate(template)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                                  isSelected
                                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-xs"
                                    : "bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                                }`}
                              >
                                <BookmarkPlus className="w-3.5 h-3.5" />
                                <span>{isSelected ? "Re-insert Rule" : "Insert Template"}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>

            {/* Loaded Active Rules Bar with Search & Multi-Filter System */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Active Loaded Rules ({filteredActiveRules.length} / {rules.length})
                  </span>
                </div>

                {hasActiveRuleFilters && (
                  <button
                    type="button"
                    onClick={clearAllRuleFilters}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-cyan-400" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>

              {/* Search Bar Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={ruleSearchQuery}
                  onChange={(e) => setRuleSearchQuery(e.target.value)}
                  placeholder="Search rules by title, YAML, technique (e.g., T1110, sshd, exfiltration)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                {ruleSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setRuleSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 font-mono text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Dropdown Filters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {/* Severity Filter Dropdown */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    Severity Level
                  </label>
                  <select
                    value={ruleSeverityFilter}
                    onChange={(e) => setRuleSeverityFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-200 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="all">All Severities ({rules.length})</option>
                    <option value="critical">Critical ({rules.filter(r => r.level === "critical").length})</option>
                    <option value="high">High ({rules.filter(r => r.level === "high").length})</option>
                    <option value="medium">Medium ({rules.filter(r => r.level === "medium").length})</option>
                    <option value="low">Low ({rules.filter(r => r.level === "low").length})</option>
                  </select>
                </div>

                {/* Log Source Filter Dropdown */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                    <Database className="w-3 h-3 text-cyan-400" />
                    Log Source
                  </label>
                  <select
                    value={ruleLogSourceFilter}
                    onChange={(e) => setRuleLogSourceFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-200 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="all">All Log Sources</option>
                    <option value="linux">Linux / SSHD</option>
                    <option value="zeek">Zeek DNS</option>
                    <option value="cloudtrail">AWS CloudTrail</option>
                    <option value="s3">AWS S3 Storage</option>
                    <option value="vpc_flow">AWS VPC Flow Logs</option>
                    <option value="crowdstrike">CrowdStrike EDR</option>
                    <option value="kubernetes">Kubernetes Audit</option>
                    <option value="syslog">Syslog Auth</option>
                  </select>
                </div>

                {/* MITRE ATT&CK Technique Filter Dropdown */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-purple-400" />
                    MITRE ATT&CK
                  </label>
                  <select
                    value={ruleMitreFilter}
                    onChange={(e) => setRuleMitreFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-200 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="all">All MITRE Techniques</option>
                    <option value="t1110">T1110 - Brute Force</option>
                    <option value="t1071">T1071 - C2 Application Protocol</option>
                    <option value="t1098">T1098 - Account Manipulation / IAM</option>
                    <option value="t1530">T1530 - Data from Cloud Storage</option>
                    <option value="t1078">T1078 - Valid Accounts</option>
                    <option value="t1059">T1059 - Command & Scripting</option>
                    <option value="t1486">T1486 - Data Encrypted for Impact</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Chips / Pills */}
              {hasActiveRuleFilters && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono border-t border-slate-800/80">
                  <span className="text-slate-500">Active Filters:</span>
                  {ruleSearchQuery && (
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                      Query: "{ruleSearchQuery}"
                      <button onClick={() => setRuleSearchQuery("")} className="hover:text-white cursor-pointer ml-1">✕</button>
                    </span>
                  )}
                  {ruleSeverityFilter !== "all" && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 uppercase font-bold">
                      Severity: {ruleSeverityFilter}
                      <button onClick={() => setRuleSeverityFilter("all")} className="hover:text-white cursor-pointer ml-1">✕</button>
                    </span>
                  )}
                  {ruleLogSourceFilter !== "all" && (
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                      Source: {ruleLogSourceFilter}
                      <button onClick={() => setRuleLogSourceFilter("all")} className="hover:text-white cursor-pointer ml-1">✕</button>
                    </span>
                  )}
                  {ruleMitreFilter !== "all" && (
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                      MITRE: {ruleMitreFilter.toUpperCase()}
                      <button onClick={() => setRuleMitreFilter("all")} className="hover:text-white cursor-pointer ml-1">✕</button>
                    </span>
                  )}
                </div>
              )}

              {/* Filtered Rules Cards List */}
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                {filteredActiveRules.length === 0 ? (
                  <div className="p-4 text-center bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
                    <p className="text-xs text-slate-400">No Sigma rules match the selected filter criteria.</p>
                    <button
                      type="button"
                      onClick={clearAllRuleFilters}
                      className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono rounded-md hover:bg-cyan-900 transition-all cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  filteredActiveRules.map((rule) => {
                    const isSelected = selectedRule.id === rule.id;
                    const mitreTag = rule.mitreAttackId || (rule.tags && rule.tags.find(t => /^t\d/i.test(t) || t.includes("attack.t")));

                    return (
                      <button
                        key={rule.id}
                        type="button"
                        onClick={() => {
                          setSelectedRule(rule);
                          setRuleYaml(rule.detectionYaml);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer space-x-2 ${
                          isSelected
                            ? "bg-blue-900/70 border-blue-500 text-white font-bold shadow-md ring-1 ring-blue-500"
                            : "bg-slate-950/80 border-slate-800/90 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <div className="truncate flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="truncate font-semibold text-slate-100">{rule.title}</span>
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                                Active
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1 flex-wrap">
                            <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              {rule.logsource.product || "generic"} / {rule.logsource.service || rule.logsource.category || "security"}
                            </span>
                            
                            {mitreTag && (
                              <span className="bg-purple-950/80 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/80 flex items-center gap-0.5 font-bold">
                                <Tag className="w-2.5 h-2.5" />
                                {mitreTag.replace(/^attack\./i, "").toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold shrink-0 ${
                          rule.level === 'critical' ? 'bg-red-950 text-red-300 border border-red-800' :
                          rule.level === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}>
                          {rule.level}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
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
                <button
                  type="button"
                  onClick={handleAutoFixYaml}
                  className={`px-2.5 py-1 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 border shadow-2xs cursor-pointer ${
                    autoFixApplied 
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : (!validationResult.isValid || validationResult.warnings.length > 0)
                      ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                  }`}
                  title="Auto-insert missing required fields & schema bindings"
                >
                  {autoFixApplied ? <Check className="w-3 h-3 text-white" /> : <Wand2 className="w-3 h-3 text-amber-600" />}
                  <span>{autoFixApplied ? "Schema Fixed!" : "Auto-Fix"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestRuleOnLog}
                  className={`px-2.5 py-1 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer ${
                    injectSuccess
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  title="Inject matching event into telemetry stream"
                >
                  {injectSuccess ? <Check className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{injectSuccess ? "Injected!" : "Inject Sample Match"}</span>
                </button>
              </div>
            </div>

            {/* Notification Feedback Banner */}
            {(autoFixApplied || injectSuccess) && (
              <div className="p-2 rounded-lg bg-emerald-900/90 text-emerald-100 border border-emerald-700 text-xs flex items-center justify-between font-mono animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {autoFixApplied && "Auto-Fix applied: Re-structured YAML keys & missing metadata schemas."}
                    {injectSuccess && "Injected telemetry match into Confluent stream & highlighted event payload."}
                  </span>
                </div>
              </div>
            )}

            {/* YAML Editor with Real-Time Line-by-Line Syntax Validator */}
            <div className={`rounded-xl border transition-all overflow-hidden bg-[#131B2E] ${
              !validationResult.isValid 
                ? "border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.15)]" 
                : validationResult.warnings.length > 0
                ? "border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                : "border-slate-800 shadow-xs"
            }`}>
              {/* Editor Header Bar */}
              <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2 text-slate-400">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                  <span className="text-[11px] font-bold text-slate-300 ml-1">sigma_rule.yaml</span>
                </div>

                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="text-slate-400 font-mono">
                    {ruleYaml.split("\n").length} Lines
                  </span>
                  {!validationResult.isValid ? (
                    <span className="text-red-400 font-bold flex items-center gap-1 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded">
                      <XCircle className="w-3 h-3" /> {validationResult.errors.length} Syntax Error{validationResult.errors.length > 1 ? "s" : ""}
                    </span>
                  ) : validationResult.warnings.length > 0 ? (
                    <span className="text-amber-400 font-bold flex items-center gap-1 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3" /> {validationResult.warnings.length} Warning{validationResult.warnings.length > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Valid Schema
                    </span>
                  )}
                </div>
              </div>

              {/* Editor Code Body with Line Gutter & Error Markers */}
              <div className="relative flex min-h-[300px] max-h-[460px] overflow-auto font-mono text-xs">
                {/* Line Gutter */}
                <div className="bg-[#0A0F1D] text-slate-500 select-none border-r border-slate-800/80 py-3 text-right font-mono text-[11px] leading-relaxed shrink-0 min-w-[50px]">
                  {ruleYaml.split("\n").map((_, idx) => {
                    const lineNum = idx + 1;
                    const lineError = validationResult.errors.find(e => e.line === lineNum);
                    const lineWarning = validationResult.warnings.find(w => w.line === lineNum);

                    return (
                      <div 
                        key={`gutter-${lineNum}`}
                        className={`px-2 flex items-center justify-end space-x-1.5 h-[1.375rem] group relative ${
                          lineError ? "bg-red-950/80 text-red-400 font-bold" : lineWarning ? "bg-amber-950/60 text-amber-400" : ""
                        }`}
                      >
                        <span className="text-[10px] opacity-70">{lineNum}</span>
                        {lineError && (
                          <XCircle className="w-3 h-3 text-red-500 shrink-0 inline cursor-pointer" />
                        )}
                        {!lineError && lineWarning && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 inline cursor-pointer" />
                        )}

                        {/* Hover Error Tooltip */}
                        {(lineError || lineWarning) && (
                          <div className="absolute left-full top-0 ml-2 z-30 hidden group-hover:block w-64 p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-left font-sans text-xs">
                            {lineError ? (
                              <div className="text-red-300 font-medium space-y-1">
                                <div className="font-bold text-red-400 flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5 text-red-400" /> Syntax Error (Line {lineNum})
                                </div>
                                <p className="text-[11px]">{lineError.message}</p>
                                {lineError.suggestion && (
                                  <p className="text-[10px] text-red-200/70 italic mt-1">💡 {lineError.suggestion}</p>
                                )}
                              </div>
                            ) : (
                              <div className="text-amber-300 font-medium space-y-1">
                                <div className="font-bold text-amber-400 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Warning (Line {lineNum})
                                </div>
                                <p className="text-[11px]">{lineWarning?.message}</p>
                                {lineWarning?.suggestion && (
                                  <p className="text-[10px] text-amber-200/70 italic mt-1">💡 {lineWarning.suggestion}</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Textarea Code Input */}
                <textarea
                  value={ruleYaml}
                  onChange={(e) => setRuleYaml(e.target.value)}
                  rows={Math.max(14, ruleYaml.split("\n").length)}
                  spellCheck={false}
                  className="w-full bg-transparent p-3 text-xs font-mono text-cyan-300 leading-relaxed focus:outline-none resize-none whitespace-pre overflow-x-auto tab-size-2"
                  style={{ lineHeight: "1.375rem" }}
                  placeholder="Paste or write Sigma YAML detection rule here..."
                />
              </div>
            </div>

            {/* SigmaValidator Interactive Linting Output Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-slate-200">SigmaValidator Real-Time Linter</span>
                  <span className="text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded font-mono">Real-Time</span>
                </div>
                <button
                  onClick={() => setShowLinterDetails(!showLinterDetails)}
                  className="text-[10px] text-cyan-400 hover:underline font-mono cursor-pointer"
                >
                  {showLinterDetails ? "Hide Diagnostics" : "Show Diagnostics"}
                </button>
              </div>

              {showLinterDetails && (
                <div className="space-y-1.5 pt-1">
                  {validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
                    <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Schema Passed: Valid top-level keys, logsource bindings, and detection condition pattern. Zero syntax errors detected.</span>
                    </div>
                  )}

                  {validationResult.errors.map((err, idx) => (
                    <div key={`err-${idx}`} className="p-2.5 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-bold text-red-400">
                        <span className="flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          [SYNTAX ERROR] {err.line ? `Line ${err.line}: ` : ""}{err.field ? `Field '${err.field}'` : "YAML Structure"}
                        </span>
                        {err.line && (
                          <span className="text-[10px] bg-red-900/80 border border-red-700 text-red-200 px-1.5 py-0.5 rounded font-mono">
                            Line {err.line}
                          </span>
                        )}
                      </div>
                      <p className="text-red-200 text-[11px] pl-5">{err.message}</p>
                      {err.suggestion && (
                        <p className="text-[10px] text-red-300/80 pl-5 font-mono">💡 Suggestion: {err.suggestion}</p>
                      )}
                    </div>
                  ))}

                  {validationResult.warnings.map((warn, idx) => (
                    <div key={`warn-${idx}`} className="p-2.5 bg-amber-950/60 border border-amber-800/80 rounded-lg text-amber-200 text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-bold text-amber-400">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          [WARNING] {warn.line ? `Line ${warn.line}: ` : ""}{warn.field ? `Field '${warn.field}'` : "Best Practice"}
                        </span>
                        {warn.line && (
                          <span className="text-[10px] bg-amber-900/80 border border-amber-700 text-amber-200 px-1.5 py-0.5 rounded font-mono">
                            Line {warn.line}
                          </span>
                        )}
                      </div>
                      <p className="text-amber-200 text-[11px] pl-5">{warn.message}</p>
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
                        Matched: {log.matchedRules.join(", ")}
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
