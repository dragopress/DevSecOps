import React, { useState } from "react";
import { CheckovResult } from "../types";
import { checkovResults } from "../data/mockSecurityData";
import { 
  GitBranch, 
  GitCommit,
  Play, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Layers, 
  RefreshCw,
  Lock,
  FileCode2,
  Info,
  X,
  Copy,
  Check,
  Search,
  Filter,
  FileText,
  Sparkles,
  ShieldAlert,
  Clock,
  ArrowRight,
  ChevronRight,
  Server,
  Cloud,
  Database,
  CircleDashed,
  Activity,
  CheckCircle
} from "lucide-react";

export interface BuildspecSecurityFinding {
  id: string;
  ruleId: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "PASSED" | "FAILED" | "WARNING";
  category: string;
  lineNumber?: string;
  description: string;
  remediation: string;
}

export interface PipelineStageConfig {
  id: number;
  code: string;
  name: string;
  shortDesc: string;
  category: "Source Trigger" | "Static Analysis" | "IaC Compliance" | "Spec Diff" | "Security Gate" | "AWS Deploy";
  icon: React.FC<{ className?: string }>;
  duration: string;
  subChecks: { label: string; passed: boolean }[];
  summary: string;
  logs: string[];
}

export const CiCdScanner: React.FC = () => {
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [pipelineState, setPipelineState] = useState<"success" | "running" | "idle">("success");
  const [activeStage, setActiveStage] = useState<number>(6); // Default 6 (all complete)
  const [selectedInspectStage, setSelectedInspectStage] = useState<number>(3); // Default view Stage 3 (Checkov)
  const [showSpecModal, setShowSpecModal] = useState<boolean>(false);
  const [copiedSpec, setCopiedSpec] = useState<boolean>(false);

  const defaultSpecFindings: BuildspecSecurityFinding[] = [
    {
      id: "spec-1",
      ruleId: "CKV_AWS_BUILD_01",
      title: "SSM Parameter Store Secrets Reference",
      severity: "HIGH",
      status: "PASSED",
      category: "Secrets Management",
      lineNumber: "Lines 36-37",
      description: "KMS_KEY_ARN is referenced securely via AWS Systems Manager Parameter Store (/secops/prod/kms_key_arn) rather than hardcoded in plaintext.",
      remediation: "Maintain reference to AWS Parameter Store or Secrets Manager for all sensitive credentials."
    },
    {
      id: "spec-2",
      ruleId: "CKV_AWS_BUILD_02",
      title: "Mandatory Pre-Build Static Analysis Gate",
      severity: "CRITICAL",
      status: "PASSED",
      category: "Pipeline Security",
      lineNumber: "Lines 50-57",
      description: "Checkov v3.2.0 and tfsec scanners are enforced during pre_build phase, preventing unvetted HCL deployment.",
      remediation: "Ensure static analysis binaries exit with non-zero status upon detecting High/Critical vulnerabilities."
    },
    {
      id: "spec-3",
      ruleId: "CKV_AWS_BUILD_03",
      title: "Explicit Version Pinning for IaC Tooling",
      severity: "MEDIUM",
      status: "PASSED",
      category: "Dependency Pinning",
      lineNumber: "Lines 32-33",
      description: "Terraform (1.6.6) and Checkov (3.2.0) are pinned to specific versions to prevent supply-chain drift.",
      remediation: "Regularly audit and update version pins following SecOps testing."
    },
    {
      id: "spec-4",
      ruleId: "CKV_AWS_BUILD_04",
      title: "Build Artifact Encryption & Archival",
      severity: "HIGH",
      status: "PASSED",
      category: "Artifact Encryption",
      lineNumber: "Lines 79-82",
      description: "Build outputs include checkov_report.json and tfplan artifacts saved for audit trailing.",
      remediation: "Verify destination S3 bucket uses SSE-KMS customer-managed keys."
    },
    {
      id: "spec-5",
      ruleId: "CKV_AWS_BUILD_05",
      title: "Conditional Auto-Approve Deployment Gate",
      severity: "MEDIUM",
      status: "WARNING",
      category: "Access Control",
      lineNumber: "Lines 70-77",
      description: "terraform apply -auto-approve is evaluated automatically if $EXECUTE_APPLY=true.",
      remediation: "Ensure production deployments require explicit SNS/Slack manual approval gate token in CodePipeline."
    },
    {
      id: "spec-6",
      ruleId: "CKV_AWS_BUILD_06",
      title: "S3 Remote State Backend Initialization",
      severity: "HIGH",
      status: "PASSED",
      category: "Pipeline Security",
      lineNumber: "Line 62",
      description: "S3 backend uses dedicated bucket tf-state-secops-pipeline-prod-us-east-1 with DynamoDB lock support.",
      remediation: "Ensure state bucket enforces S3 Bucket Keys and Object Lock."
    }
  ];

  // Spec scan state
  const [isScanningSpec, setIsScanningSpec] = useState<boolean>(false);
  const [specFindings, setSpecFindings] = useState<BuildspecSecurityFinding[]>(defaultSpecFindings);
  const [activeSpecTab, setActiveSpecTab] = useState<"findings" | "yaml">("findings");
  const [specFilter, setSpecFilter] = useState<"ALL" | "PASSED" | "WARNING" | "FAILED">("ALL");
  const [lastScanTime, setLastScanTime] = useState<string | null>(new Date().toLocaleTimeString());

  const buildspecContent = `version: 0.2

env:
  variables:
    TF_VERSION: "1.6.6"
    CHECKOV_VERSION: "3.2.0"
    ENVIRONMENT: "prod"
    AWS_REGION: "us-east-1"
  parameter-store:
    KMS_KEY_ARN: "/secops/prod/kms_key_arn"

phases:
  install:
    runtime-versions:
      python: 3.11
    commands:
      - echo "[INFO] Installing HashiCorp Terraform \${TF_VERSION}..."
      - wget -q https://releases.hashicorp.com/terraform/\${TF_VERSION}/terraform_\${TF_VERSION}_linux_amd64.zip
      - unzip -q terraform_\${TF_VERSION}_linux_amd64.zip -d /usr/local/bin/
      - echo "[INFO] Installing Checkov Static Analysis Scanner..."
      - pip3 install --quiet checkov==\${CHECKOV_VERSION} tfsec

  pre_build:
    commands:
      - echo "[INFO] Phase 1: Validating HCL Formatting..."
      - terraform fmt -check -recursive
      - echo "[INFO] Phase 2: Executing Checkov Static Security Analysis..."
      - checkov -d . --framework terraform --compact --quiet --output cli
      - echo "[INFO] Phase 3: Executing tfsec Security Analysis..."
      - tfsec .

  build:
    commands:
      - echo "[INFO] Phase 4: Initializing S3 Remote State & DynamoDB Locks..."
      - terraform init -backend-config="bucket=tf-state-secops-pipeline-prod-us-east-1"
      - echo "[INFO] Phase 5: Validating Terraform Syntactical Structure..."
      - terraform validate
      - echo "[INFO] Phase 6: Generating Terraform Spec Diff Plan..."
      - terraform plan -out=tfplan -no-color

  post_build:
    commands:
      - echo "[INFO] Phase 7: Evaluating Auto-Apply Conditions..."
      - |
        if [ "$CODEBUILD_BUILD_SUCCEEDED" = "1" ] && [ "$EXECUTE_APPLY" = "true" ]; then
          echo "[SUCCESS] Auto-applying Terraform changes to AWS Environment..."
          terraform apply -auto-approve tfplan
        else
          echo "[INFO] Plan completed. Manual approval gate required before apply."
        fi

artifacts:
  files:
    - tfplan
    - checkov_report.json`;

  const executeSpecScan = () => {
    setIsScanningSpec(true);
    setTimeout(() => {
      setSpecFindings([
        {
          id: "spec-1",
          ruleId: "CKV_AWS_BUILD_01",
          title: "SSM Parameter Store Secrets Reference",
          severity: "HIGH",
          status: "PASSED",
          category: "Secrets Management",
          lineNumber: "Lines 36-37",
          description: "KMS_KEY_ARN is referenced securely via AWS Systems Manager Parameter Store (/secops/prod/kms_key_arn) rather than hardcoded in plaintext.",
          remediation: "Maintain reference to AWS Parameter Store or Secrets Manager for all sensitive credentials."
        },
        {
          id: "spec-2",
          ruleId: "CKV_AWS_BUILD_02",
          title: "Mandatory Pre-Build Static Analysis Gate",
          severity: "CRITICAL",
          status: "PASSED",
          category: "Pipeline Security",
          lineNumber: "Lines 50-57",
          description: "Checkov v3.2.0 and tfsec scanners are enforced during pre_build phase, preventing unvetted HCL deployment.",
          remediation: "Ensure static analysis binaries exit with non-zero status upon detecting High/Critical vulnerabilities."
        },
        {
          id: "spec-3",
          ruleId: "CKV_AWS_BUILD_03",
          title: "Explicit Version Pinning for IaC Tooling",
          severity: "MEDIUM",
          status: "PASSED",
          category: "Dependency Pinning",
          lineNumber: "Lines 32-33",
          description: "Terraform (1.6.6) and Checkov (3.2.0) are pinned to specific versions to prevent supply-chain drift.",
          remediation: "Regularly audit and update version pins following SecOps testing."
        },
        {
          id: "spec-4",
          ruleId: "CKV_AWS_BUILD_04",
          title: "Build Artifact Encryption & Archival",
          severity: "HIGH",
          status: "PASSED",
          category: "Artifact Encryption",
          lineNumber: "Lines 79-82",
          description: "Build outputs include checkov_report.json and tfplan artifacts saved for audit trailing.",
          remediation: "Verify destination S3 bucket uses SSE-KMS customer-managed keys."
        },
        {
          id: "spec-5",
          ruleId: "CKV_AWS_BUILD_05",
          title: "Conditional Auto-Approve Deployment Gate",
          severity: "MEDIUM",
          status: "WARNING",
          category: "Access Control",
          lineNumber: "Lines 70-77",
          description: "terraform apply -auto-approve is evaluated automatically if $EXECUTE_APPLY=true.",
          remediation: "Ensure production deployments require explicit SNS/Slack manual approval gate token in CodePipeline."
        },
        {
          id: "spec-6",
          ruleId: "CKV_AWS_BUILD_06",
          title: "S3 Remote State Backend Initialization",
          severity: "HIGH",
          status: "PASSED",
          category: "Pipeline Security",
          lineNumber: "Line 62",
          description: "S3 backend uses dedicated bucket tf-state-secops-pipeline-prod-us-east-1 with DynamoDB lock support.",
          remediation: "Ensure state bucket enforces S3 Bucket Keys and Object Lock."
        }
      ]);
      setLastScanTime(new Date().toLocaleTimeString());
      setIsScanningSpec(false);
    }, 750);
  };

  const handleInspectSpec = () => {
    setShowSpecModal(true);
    setActiveSpecTab("findings");
    setSpecFilter("ALL");
    executeSpecScan();
  };

  const handleCopySpec = () => {
    navigator.clipboard.writeText(buildspecContent);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  const pipelineStages: PipelineStageConfig[] = [
    {
      id: 1,
      code: "STAGE 01",
      name: "Source & Webhook",
      shortDesc: "Git Commit & Branch Audit",
      category: "Source Trigger",
      icon: GitCommit,
      duration: "0.4s",
      subChecks: [
        { label: "Commit Signature", passed: true },
        { label: "Branch Protection", passed: true },
        { label: "Webhook HMAC Auth", passed: true }
      ],
      summary: "Verified signed commit a8c90f2 on main branch. Webhook HMAC payload authenticated.",
      logs: [
        "[INFO] Event: GitHub push to refs/heads/main",
        "[INFO] Commit SHA: a8c90f23e1109bc4f3a",
        "[SUCCESS] GPG Signature Verified: devsecops-lead@company.com",
        "[SUCCESS] Webhook signature HMAC-SHA256 authenticated."
      ]
    },
    {
      id: 2,
      code: "STAGE 02",
      name: "Lint & Secrets Audit",
      shortDesc: "Static Syntax & Token Scan",
      category: "Static Analysis",
      icon: Lock,
      duration: "1.1s",
      subChecks: [
        { label: "gitleaks v8.18", passed: true },
        { label: "tflint v0.50", passed: true },
        { label: "SSM Parameter Pins", passed: true }
      ],
      summary: "Scanned HCL source files for plaintext secrets, hardcoded keys, and formatting syntax.",
      logs: [
        "[INFO] Executing 'gitleaks detect --source .'",
        "[SUCCESS] gitleaks: 0 secrets detected in repository diff.",
        "[INFO] Executing 'tflint --recursive'",
        "[SUCCESS] tflint: HCL syntax valid across 4 Terraform modules."
      ]
    },
    {
      id: 3,
      code: "STAGE 03",
      name: "Checkov IaC Audit",
      shortDesc: "CIS & Security Benchmarks",
      category: "IaC Compliance",
      icon: ShieldCheck,
      duration: "3.2s",
      subChecks: [
        { label: "Checkov 62 Checks", passed: true },
        { label: "tfsec 18 Checks", passed: true },
        { label: "0 Violations", passed: true }
      ],
      summary: "Evaluated Checkov v3.2.0 and tfsec policies against Terraform HCL. Zero critical violations found.",
      logs: [
        "[INFO] Executing 'checkov -d . --framework terraform'",
        "[PASSED] CKV_AWS_116: KMS Key Rotation verified for Flow Logs CMK.",
        "[PASSED] CKV_AWS_19: SSE-KMS default encryption verified for S3 Bucket.",
        "[PASSED] CKV_AWS_88: Amazon MSK transit encryption enforced to mTLS.",
        "[PASSED] CKV_AWS_39: EKS API endpoint private-only access enforced."
      ]
    },
    {
      id: 4,
      code: "STAGE 04",
      name: "Terraform Plan Diff",
      shortDesc: "S3 Lock & Spec Diff",
      category: "Spec Diff",
      icon: Layers,
      duration: "2.8s",
      subChecks: [
        { label: "S3 Remote Backend", passed: true },
        { label: "terraform validate", passed: true },
        { label: "Plan: +24 to Add", passed: true }
      ],
      summary: "Acquired DynamoDB lock on S3 remote state. Synthesized plan diff: 24 resources to add, 0 to destroy.",
      logs: [
        "[INFO] Executing 'terraform init -backend-config=bucket=tf-state-secops-pipeline-prod'",
        "[SUCCESS] Initialized S3 state backend with DynamoDB lock support.",
        "[INFO] Executing 'terraform validate' & 'terraform plan -out=tfplan'",
        "[INFO] Plan: 24 to add, 0 to change, 0 to destroy."
      ]
    },
    {
      id: 5,
      code: "STAGE 05",
      name: "Security Approval Gate",
      shortDesc: "OPA Conftest & KMS Audit",
      category: "Security Gate",
      icon: ShieldAlert,
      duration: "0.6s",
      subChecks: [
        { label: "KMS Key Rotation", passed: true },
        { label: "OPA Policy Gate", passed: true },
        { label: "SNS Audit Dispatch", passed: true }
      ],
      summary: "Verified KMS Key Rotation policies and executed OPA policy checks. Dispatched SNS audit notification.",
      logs: [
        "[INFO] Executing OPA/Conftest policy checks on tfplan.json...",
        "[SUCCESS] Policy Gate PASSED: All resources conform to SecOps Guardrails.",
        "[INFO] KMS Customer Managed Key (/secops/prod/kms_key_arn) validated.",
        "[INFO] Dispatched SNS audit notification token to #secops-deployments."
      ]
    },
    {
      id: 6,
      code: "STAGE 06",
      name: "AWS Deploy & Verification",
      shortDesc: "Cloud Provisioning & Verification",
      category: "AWS Deploy",
      icon: Server,
      duration: "5.4s",
      subChecks: [
        { label: "terraform apply", passed: true },
        { label: "MSK mTLS Active", passed: true },
        { label: "S3 Lake Encrypted", passed: true }
      ],
      summary: "Applied Terraform configuration to AWS us-east-1. Provisioned MSK, EKS, CloudTrail, S3 Data Lake, and Security Hub integrations.",
      logs: [
        "[INFO] Executing 'terraform apply -auto-approve tfplan'",
        "[SUCCESS] aws_s3_bucket.secops_data_lake: Creation complete after 3s",
        "[SUCCESS] aws_msk_cluster.kafka_secops: Creation complete after 4s",
        "[SUCCESS] Deployment complete! Resources verified active in us-east-1."
      ]
    }
  ];

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
    setSelectedInspectStage(1);

    setTimeout(() => {
      setActiveStage(2);
      setSelectedInspectStage(2);
    }, 1000);

    setTimeout(() => {
      setActiveStage(3);
      setSelectedInspectStage(3);
    }, 2200);

    setTimeout(() => {
      setActiveStage(4);
      setSelectedInspectStage(4);
    }, 3400);

    setTimeout(() => {
      setActiveStage(5);
      setSelectedInspectStage(5);
    }, 4500);

    setTimeout(() => {
      setActiveStage(6);
      setSelectedInspectStage(6);
    }, 5400);

    setTimeout(() => {
      setIsBuilding(false);
      setPipelineState("success");
    }, 6600);
  };

  const filteredFindings = specFindings.filter(f => {
    if (specFilter === "PASSED") return f.status === "PASSED";
    if (specFilter === "WARNING") return f.status === "WARNING";
    if (specFilter === "FAILED") return f.status === "FAILED";
    return true;
  });

  const passedCount = specFindings.filter(f => f.status === "PASSED").length;
  const warningCount = specFindings.filter(f => f.status === "WARNING").length;
  const failedCount = specFindings.filter(f => f.status === "FAILED").length;

  const activeStageData = pipelineStages.find(s => s.id === selectedInspectStage) || pipelineStages[2];

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

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={handleInspectSpec}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 font-bold text-xs rounded-lg transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Inspect CI/CD Spec</span>
          </button>

          <button
            onClick={handleTriggerBuild}
            disabled={isBuilding}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
          >
            {isBuilding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isBuilding ? `Running Stage 0${activeStage}...` : "Trigger CI/CD Deployment"}</span>
          </button>
        </div>
      </div>

      {/* Visual Workflow Pipeline Graph Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 text-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Visual Workflow Pipeline Graph
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                Commit-to-Deploy Stage Graph
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Click any stage node below to inspect real-time log outputs, security checks, and stage-specific metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Pill */}
            <div className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold border flex items-center gap-1.5 shadow-sm ${
              pipelineState === "running"
                ? "bg-cyan-950 text-cyan-300 border-cyan-700/80 animate-pulse"
                : "bg-emerald-950 text-emerald-300 border-emerald-800"
            }`}>
              {pipelineState === "running" ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>EXECUTING STAGE 0{activeStage}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PIPELINE PASSED</span>
                </>
              )}
            </div>

            <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Total Runtime: <strong>13.5s</strong></span>
            </div>

            <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
              <span>main@a8c90f2</span>
            </div>
          </div>
        </div>

        {/* Workflow Stage Cards Horizontal Graph */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-1">
          {pipelineStages.map((stg, idx) => {
            const isCompleted = activeStage > stg.id || (activeStage === 6 && pipelineState === "success");
            const isRunning = activeStage === stg.id && isBuilding;
            const isSelected = selectedInspectStage === stg.id;
            const StageIcon = stg.icon;

            return (
              <div
                key={stg.id}
                onClick={() => setSelectedInspectStage(stg.id)}
                className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "ring-2 ring-cyan-400 bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-950/40"
                    : isRunning
                    ? "bg-slate-800/80 border-cyan-500/80 shadow-md shadow-cyan-900/30"
                    : isCompleted
                    ? "bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                    : "bg-slate-950/40 border-slate-800/60 opacity-60 hover:opacity-100"
                }`}
              >
                {/* Stage Header & Status Indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {stg.code}
                  </span>

                  {isCompleted ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {stg.duration}
                    </span>
                  ) : isRunning ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                      RUNNING
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900 text-slate-500 border border-slate-800 flex items-center gap-1">
                      <CircleDashed className="w-3 h-3 text-slate-600" />
                      QUEUED
                    </span>
                  )}
                </div>

                {/* Stage Icon & Titles */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg border ${
                      isRunning
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                        : isCompleted
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-900 text-slate-500 border-slate-800"
                    }`}>
                      <StageIcon className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-white leading-snug">{stg.name}</div>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                    {stg.shortDesc}
                  </p>
                </div>

                {/* Mini Sub-Check Chips */}
                <div className="space-y-1 pt-1 border-t border-slate-800/80">
                  {stg.subChecks.slice(0, 2).map((check, cIdx) => (
                    <div key={cIdx} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 truncate max-w-[100px]">{check.label}</span>
                      {isCompleted ? (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : isRunning ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Arrow Connector Indicator for Desktop */}
                {idx < pipelineStages.length - 1 && (
                  <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <div className={`p-0.5 rounded-full border ${
                      activeStage > stg.id + 1 || (activeStage === 6 && pipelineState === "success")
                        ? "bg-slate-900 text-emerald-400 border-emerald-800"
                        : activeStage === stg.id + 1 && isBuilding
                        ? "bg-cyan-950 text-cyan-300 border-cyan-700 animate-pulse"
                        : "bg-slate-950 text-slate-600 border-slate-800"
                    }`}>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Stage Deep Inspector Drawer */}
        <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-cyan-950 border border-cyan-800 rounded-lg text-cyan-300">
                <activeStageData.icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{activeStageData.code}: {activeStageData.name}</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.2 bg-slate-900 text-cyan-300 border border-slate-800 rounded">
                    {activeStageData.category}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">{activeStageData.summary}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                Stage Execution Time: <strong className="text-cyan-300">{activeStageData.duration}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
            {/* Sub-Checks Checklist */}
            <div className="md:col-span-5 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Security Controls</div>
              <div className="space-y-1.5">
                {activeStageData.subChecks.map((sc, i) => (
                  <div key={i} className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium">{sc.label}</span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      PASSED
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Output Log Terminal */}
            <div className="md:col-span-7 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage Log Telemetry</div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 space-y-1 max-h-[130px] overflow-y-auto">
                {activeStageData.logs.map((log, lIdx) => (
                  <div key={lIdx} className="flex space-x-2">
                    <span className="text-slate-600 select-none">$</span>
                    <span className={log.includes("[SUCCESS]") || log.includes("[PASSED]") ? "text-emerald-400" : "text-cyan-300"}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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

      {/* CI/CD Buildspec Modal */}
      {showSpecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    AWS CodeBuild Spec & Static Scan Inspector
                    <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-700/50 px-2 py-0.5 rounded">
                      buildspec.yml
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Automated static analysis auditing buildspec phases, secrets handling, and artifact security.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={executeSpecScan}
                  disabled={isScanningSpec}
                  className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isScanningSpec ? "animate-spin" : ""}`} />
                  <span>{isScanningSpec ? "Scanning Spec..." : "Re-Scan Spec"}</span>
                </button>
                <button
                  onClick={() => setShowSpecModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-5 pt-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveSpecTab("findings")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
                    activeSpecTab === "findings"
                      ? "bg-slate-900 text-cyan-300 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200 border-transparent"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Spec Security Scan Findings</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                    {specFindings.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveSpecTab("yaml")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
                    activeSpecTab === "yaml"
                      ? "bg-slate-900 text-cyan-300 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200 border-transparent"
                  }`}
                >
                  <FileCode2 className="w-4 h-4 text-blue-400" />
                  <span>Raw YAML Spec</span>
                </button>
              </div>

              {lastScanTime && (
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 pb-2">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Last Scanned: {lastScanTime}</span>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              {activeSpecTab === "findings" ? (
                <div className="space-y-4">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Evaluated Controls</div>
                      <div className="text-xl font-bold text-white font-mono">{specFindings.length}</div>
                    </div>

                    <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase">Passed Checks</div>
                      <div className="text-xl font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{passedCount}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-950/40 border border-amber-900/60 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold text-amber-400 uppercase">Warnings / Advisory</div>
                      <div className="text-xl font-bold text-amber-400 font-mono flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>{warningCount}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Failures Detected</div>
                      <div className="text-xl font-bold text-emerald-400 font-mono">
                        {failedCount}
                      </div>
                    </div>
                  </div>

                  {/* Filter Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-300">Filter Findings:</span>
                      {(["ALL", "PASSED", "WARNING", "FAILED"] as const).map(flt => (
                        <button
                          key={flt}
                          onClick={() => setSpecFilter(flt)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            specFilter === flt
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                          }`}
                        >
                          {flt}
                        </button>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Showing <strong className="text-white">{filteredFindings.length}</strong> of {specFindings.length} Security Controls
                    </div>
                  </div>

                  {/* Scanning Indicator */}
                  {isScanningSpec ? (
                    <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                      <p className="text-sm font-bold text-slate-300">Scanning buildspec.yml with Checkov & Static Policy Engine...</p>
                      <p className="text-xs text-slate-500">Evaluating parameter-store bindings, phase ordering, and artifact KMS settings.</p>
                    </div>
                  ) : (
                    /* Findings Cards List */
                    <div className="space-y-3">
                      {filteredFindings.map((finding) => (
                        <div
                          key={finding.id}
                          className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-cyan-400 font-bold text-xs">{finding.ruleId}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-800">
                                {finding.category}
                              </span>
                              {finding.lineNumber && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
                                  {finding.lineNumber}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                finding.severity === "CRITICAL" ? "bg-red-950 text-red-400 border-red-800" :
                                finding.severity === "HIGH" ? "bg-amber-950 text-amber-400 border-amber-800" :
                                "bg-blue-950 text-blue-400 border-blue-800"
                              }`}>
                                {finding.severity}
                              </span>

                              {finding.status === "PASSED" ? (
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  PASSED
                                </span>
                              ) : finding.status === "WARNING" ? (
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                                  WARNING
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800 flex items-center gap-1">
                                  <ShieldAlert className="w-3 h-3 text-red-400" />
                                  FAILED
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-sm font-bold text-slate-100">{finding.title}</div>
                          <p className="text-xs text-slate-400 leading-relaxed">{finding.description}</p>

                          <div className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-lg text-[11px] text-slate-300 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-cyan-300 font-semibold">Remediation Guidance:</strong>{" "}
                              <span>{finding.remediation}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Raw YAML Spec View */
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-slate-200">Enforced Gates:</span>
                      <span className="text-slate-400">CKV_AWS_116 (KMS), CKV_AWS_19 (S3 Encryption), CKV_AWS_88 (mTLS)</span>
                    </div>
                    <button
                      onClick={handleCopySpec}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-all text-[11px] cursor-pointer"
                    >
                      {copiedSpec ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{copiedSpec ? "Copied!" : "Copy YAML"}</span>
                    </button>
                  </div>

                  {/* YAML Code Block */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] leading-relaxed select-text shadow-inner">
                    <pre>{buildspecContent}</pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="text-xs text-slate-500 font-mono">
                Trigger: Git Push (main branch) or CodePipeline Webhook
              </div>
              <button
                onClick={() => setShowSpecModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Spec Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

