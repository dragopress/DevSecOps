import React, { useState } from "react";
import { CheckovResult } from "../types";
import { checkovResults } from "../data/mockSecurityData";
import { 
  GitBranch, 
  Play, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Layers, 
  RefreshCw,
  Lock,
  FileCode2
} from "lucide-react";

export const CiCdScanner: React.FC = () => {
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [pipelineState, setPipelineState] = useState<"success" | "running" | "idle">("success");
  const [activeStage, setActiveStage] = useState<number>(4);

  const buildLogs = [
    "[INFO] AWS CodeBuild environment initialized: Python 3.11, Terraform v1.6.6",
    "[INFO] Phase: INSTALL - Downloading HashiCorp Terraform v1.6.6 & Checkov v3.2.0...",
    "[INFO] Phase: PRE_BUILD - Running 'terraform fmt -check -recursive'...",
    "[SUCCESS] Formatting check passed cleanly across all 4 modules.",
    "[INFO] Phase: PRE_BUILD - Executing Checkov Static Infrastructure Analysis...",
    "[PASSED] CKV_AWS_116: KMS Key Rotation verified for Flow Logs CMK.",
    "[PASSED] CKV_AWS_19: SSE-KMS SSE default encryption verified for Matano S3 Bucket.",
    "[PASSED] CKV_AWS_88: Amazon MSK cluster transit encryption enforced to TLS ONLY (mTLS).",
    "[PASSED] CKV_AWS_39: EKS cluster API endpoint set to private-only access.",
    "[INFO] Checkov Analysis Result: 0 Critical, 0 High, 0 Medium failures detected.",
    "[INFO] Phase: BUILD - Running 'terraform init' with S3 state storage & DynamoDB locks...",
    "[SUCCESS] Initialized S3 backend: tf-state-secops-pipeline-prod-us-east-1",
    "[INFO] Phase: BUILD - Running 'terraform validate'...",
    "[SUCCESS] Success! The configuration is valid.",
    "[INFO] Phase: BUILD - Running 'terraform plan -out=tfplan'...",
    "[INFO] Plan: 24 to add, 0 to change, 0 to destroy.",
    "[INFO] Phase: POST_BUILD - Auto-apply trigger evaluated ($EXECUTE_APPLY=true)...",
    "[SUCCESS] Terraform Apply Complete! Resources provisioned successfully."
  ];

  const handleTriggerBuild = () => {
    setIsBuilding(true);
    setPipelineState("running");
    setActiveStage(1);

    setTimeout(() => setActiveStage(2), 1000);
    setTimeout(() => setActiveStage(3), 2200);
    setTimeout(() => {
      setActiveStage(4);
      setIsBuilding(false);
      setPipelineState("success");
    }, 3500);
  };

  const stages = [
    { name: "Source Code", desc: "GitHub / CodeCommit" },
    { name: "Checkov Security", desc: "Static Analysis Scanner" },
    { name: "Terraform Plan", desc: "Synthesizing HCL Diff" },
    { name: "Terraform Apply", desc: "Deploying AWS Resources" }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            DevSecOps CI/CD Pipeline & Checkov Static Scanner
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AWS CodePipeline & CodeBuild workflow validating Terraform modules with Checkov & tfsec prior to applying changes.
          </p>
        </div>

        <button
          onClick={handleTriggerBuild}
          disabled={isBuilding}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center space-x-2 self-start md:self-auto"
        >
          {isBuilding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isBuilding ? "Running CodeBuild Spec..." : "Trigger CI/CD Deployment"}</span>
        </button>
      </div>

      {/* CodePipeline Stage Flow */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          AWS CodePipeline Stage Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {stages.map((stg, idx) => {
            const isDone = activeStage > idx + 1 || (activeStage === 4 && pipelineState === "success");
            const isCurrent = activeStage === idx + 1 && isBuilding;

            return (
              <div
                key={stg.name}
                className={`p-3.5 rounded-lg border transition-all ${
                  isCurrent
                    ? "bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-400"
                    : isDone
                    ? "bg-emerald-50/60 border-emerald-200 text-slate-800"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Stage 0{idx + 1}</span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  )}
                </div>
                <div className="font-bold text-xs text-slate-900">{stg.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{stg.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Checkov Security Report & CodeBuild Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Checkov Compliance Report */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Checkov & tfsec Security Policy Audit
            </h3>
            <span className="text-xs text-emerald-800 font-bold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
              0 Violations
            </span>
          </div>

          <div className="space-y-2.5">
            {checkovResults.map((check) => (
              <div key={check.checkId} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-blue-700 font-bold">{check.checkId}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {check.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">{check.file}</span>
                </div>

                <div className="text-slate-900 font-bold">{check.checkName}</div>
                <div className="text-[11px] text-slate-600 font-medium">{check.guidance}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: CodeBuild Execution Console Log */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">AWS CodeBuild Execution Output</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">buildspec.yml</span>
          </div>

          {/* Terminal Output Box */}
          <div className="bg-[#1F2937] border border-slate-700 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-1.5 max-h-[460px] overflow-y-auto leading-relaxed shadow-inner">
            {buildLogs.map((log, index) => (
              <div key={index} className="flex space-x-2">
                <span className="text-slate-500 select-none">$</span>
                <span className={
                  log.includes("[SUCCESS]") || log.includes("[PASSED]") ? "text-emerald-400 font-medium" :
                  log.includes("[INFO]") ? "text-cyan-300" : "text-slate-300"
                }>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
