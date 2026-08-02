import React, { useState } from "react";
import { CustomVariables } from "../types";
import { 
  Bot, 
  Sparkles, 
  Send, 
  Code2, 
  Copy, 
  Check, 
  HelpCircle, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";

interface AiArchitectProps {
  vars: CustomVariables;
}

export const AiArchitect: React.FC<AiArchitectProps> = ({ vars }) => {
  const [activeSubTab, setActiveSubTab] = useState<"sigma" | "review">("sigma");
  const [prompt, setPrompt] = useState("");
  const [logType, setLogType] = useState("VPC Flow Logs");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const samplePrompts = [
    "Detect SSH brute force attacks with more than 10 failed logins in 60 seconds",
    "Detect unauthorized AWS IAM Access Key creation from external unapproved IP addresses",
    "Detect Cobalt Strike DNS beaconing queries with TXT records targeting dynamic C2 domains",
    "Detect suspicious S3 GetObject bulk data exfiltration from private security lake buckets"
  ];

  const handleGenerateSigma = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setAiOutput(null);

    try {
      const res = await fetch("/api/ai/generate-sigma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, logType })
      });

      const data = await res.json();
      if (res.ok) {
        setAiOutput(data.result);
      } else {
        setErrorMsg(data.error || "Failed to call Gemini AI API.");
      }
    } catch (err: any) {
      setErrorMsg("Network error connecting to Gemini AI backend service.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeArch = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setAiOutput(null);

    try {
      const res = await fetch("/api/ai/analyze-architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: prompt,
          terraformContext: `AWS Region: ${vars.awsRegion}, VPC: ${vars.vpcCidr}, Environment: ${vars.environment}, MSK Brokers: ${vars.kafkaBrokerCount}, EKS Nodes: ${vars.eksNodeCount}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAiOutput(data.result);
      } else {
        setErrorMsg(data.error || "Failed to call Gemini AI API.");
      }
    } catch (err: any) {
      setErrorMsg("Network error connecting to Gemini AI backend service.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (aiOutput) {
      navigator.clipboard.writeText(aiOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            AI DevSecOps Cloud Architect (Powered by Gemini)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate custom Sigma detection rules or receive AI threat modeling & Terraform optimization guidance.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => { setActiveSubTab("sigma"); setAiOutput(null); }}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              activeSubTab === "sigma"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sigma Rule Generator
          </button>
          <button
            onClick={() => { setActiveSubTab("review"); setAiOutput(null); }}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              activeSubTab === "review"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Architecture Advisor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Pane */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            {activeSubTab === "sigma" ? "Define Detection Goal" : "Ask Security Architect"}
          </h3>

          {activeSubTab === "sigma" && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Target Log Source</label>
              <select
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono font-medium"
              >
                <option value="VPC Flow Logs">VPC Flow Logs (Network)</option>
                <option value="CloudTrail">AWS CloudTrail (API Audit)</option>
                <option value="Zeek DNS">Zeek DNS Logs (Network)</option>
                <option value="CrowdStrike">CrowdStrike EDR (Endpoint)</option>
                <option value="Linux Syslog">Linux Syslog / SSH</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
              {activeSubTab === "sigma" ? "Threat Prompt" : "Question / Concern"}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={activeSubTab === "sigma" ? "e.g., Detect SSH brute force attempts from single IP..." : "e.g., How does ACM Private CA enforce mTLS on Amazon MSK brokers?"}
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed font-mono"
            />
          </div>

          {/* Sample Prompts */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sample Prompts</label>
            <div className="space-y-1.5">
              {samplePrompts.map((sp, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(sp)}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 text-[11px] text-slate-700 font-medium transition-all truncate"
                >
                  "{sp}"
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={activeSubTab === "sigma" ? handleGenerateSigma : handleAnalyzeArch}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isGenerating ? "Gemini AI Thinking..." : "Submit to AI Architect"}</span>
          </button>
        </div>

        {/* Right Output Pane */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-600" />
              AI Architect Response
            </h3>

            {aiOutput && (
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-md transition-all flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Response"}</span>
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-[#1F2937] border border-slate-700 rounded-lg p-4 font-mono text-xs text-cyan-300 min-h-[380px] max-h-[520px] overflow-y-auto leading-relaxed whitespace-pre-wrap shadow-inner">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
                <Sparkles className="w-8 h-8 text-blue-400 animate-spin" />
                <span>Evaluating threat rules & architecture parameters via Gemini 2.5 Flash...</span>
              </div>
            ) : aiOutput ? (
              aiOutput
            ) : (
              <div className="text-slate-400 text-center py-20 font-medium">
                Select a sample prompt or describe your security detection requirements on the left to generate Sigma rules or advice.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
