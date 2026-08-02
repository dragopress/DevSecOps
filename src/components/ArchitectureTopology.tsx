import React, { useState } from "react";
import { PipelineNode, CustomVariables, ActiveTab } from "../types";
import { initialPipelineNodes } from "../data/mockSecurityData";
import { D3TopologyGraph } from "./D3TopologyGraph";
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Database, 
  Server, 
  Cpu, 
  Key, 
  CheckCircle2, 
  Layers,
  Radio,
  FileCode2,
  Zap,
  Info,
  Download,
  Activity,
  Sparkles,
  Grid,
  X,
  Copy,
  Check,
  Terminal,
  Play
} from "lucide-react";

interface TopologyProps {
  vars: CustomVariables;
  onOpenTerraformModule?: (moduleName: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const ArchitectureTopology: React.FC<TopologyProps> = ({ vars, onOpenTerraformModule, onNavigateTab }) => {
  const [selectedNode, setSelectedNode] = useState<PipelineNode>(initialPipelineNodes[0]);
  const [topologyView, setTopologyView] = useState<"d3" | "cards">("d3");
  const [downloading, setDownloading] = useState<boolean>(false);
  const [showCiCdModal, setShowCiCdModal] = useState<boolean>(false);
  const [copiedSpec, setCopiedSpec] = useState<boolean>(false);

  const buildspecContent = `version: 0.2

env:
  variables:
    TF_VERSION: "1.6.6"
    CHECKOV_VERSION: "3.2.0"
    ENVIRONMENT: "${vars.environment}"
    AWS_REGION: "${vars.awsRegion}"
  parameter-store:
    KMS_KEY_ARN: "/secops/${vars.environment}/kms_key_arn"

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
      - terraform init -backend-config="bucket=tf-state-${vars.projectName}-${vars.environment}-${vars.awsRegion}"
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

  const handleCopySpec = () => {
    navigator.clipboard.writeText(buildspecContent);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  const handleDownloadDeploymentPlan = () => {
    setDownloading(true);

    const deploymentPlanArtifact = {
      project: "SecOps Managed Cybersecurity Event Pipeline",
      version: "2.4.0",
      generatedAt: new Date().toISOString(),
      environment: vars.environment,
      region: vars.awsRegion,
      cisComplianceStatus: "100% Passed (CIS AWS Foundations Baseline)",
      customVariables: vars,
      terraformModules: [
        {
          module: "modules/networking",
          resources: ["aws_vpc.secops_vpc", "aws_subnet.isolated", "aws_flow_log.vpc_flow_logs"],
          cidrBlock: vars.vpcCidr
        },
        {
          module: "modules/messaging",
          resources: ["aws_msk_cluster.kafka_cluster", "aws_acmpca_certificate_authority.msk_ca"],
          brokers: vars.kafkaBrokerCount,
          instanceType: vars.kafkaInstanceType,
          encryption: "TLS 1.3 / mTLS"
        },
        {
          module: "modules/processing",
          resources: ["aws_eks_cluster.secops_eks", "aws_eks_node_group.vector_workers"],
          nodeCount: vars.eksNodeCount,
          instanceType: vars.eksInstanceType,
          apiEndpointAccess: "Private Only"
        },
        {
          module: "modules/connectors",
          resources: ["aws_mskconnect_connector.iceberg_s3_sink", "aws_iam_role.kafka_connect_irsa"],
          topic: "processed-logs",
          targetFormat: "Apache Iceberg"
        },
        {
          module: "modules/rules",
          resources: ["aws_s3_bucket.secops_sigma_rules", "aws_s3_bucket_policy.irsa_sync"],
          encryption: "KMS SSE-KMS CMK"
        },
        {
          module: "modules/data_lake",
          resources: ["aws_s3_bucket.matano_lake_storage", "aws_s3_bucket_lifecycle_configuration.lake"],
          glacierTransitionDays: vars.glacierTransitionDays,
          glacierExpirationDays: vars.glacierExpirationDays
        }
      ],
      securityBaseline: {
        kmsKeyRotation: "365 days auto-rotation enabled",
        s3PublicAccessBlock: "Enforced across all buckets",
        networkIsolation: "Private subnets + NAT Gateways",
        authentication: "Mutual TLS (mTLS) with ACM Private CA",
        iamPolicyScope: "IRSA Least-Privilege Role Bindings"
      }
    };

    const jsonBlob = new Blob([JSON.stringify(deploymentPlanArtifact, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `secops-deployment-plan-${vars.environment}-${vars.awsRegion}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloading(false), 800);
  };

  const getNodeIcon = (category: PipelineNode["category"]) => {
    switch (category) {
      case "edge": return Server;
      case "ingestion": return Radio;
      case "processing": return Cpu;
      case "datalake": return Database;
      case "cicd": return Layers;
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Hybrid Cybersecurity Data Pipeline Architecture
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Decoupled, high-throughput security event streaming pipeline using open-source tools deployed on AWS. 
              Click any architecture node below to inspect security controls, mTLS certificates, KMS CMKs, and IRSA bindings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadDeploymentPlan}
              disabled={downloading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center space-x-2"
            >
              <Download className={`w-4 h-4 ${downloading ? "animate-bounce" : ""}`} />
              <span>{downloading ? "Exporting Plan..." : "Download Deployment Plan (JSON)"}</span>
            </button>

            <div className="flex items-center space-x-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-emerald-400">mTLS 1.3 Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Diagram Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topology Visual Map */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
            <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              Real-Time End-to-End Log Streaming Flow
            </h3>

            <div className="flex items-center space-x-2">
              <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl">
                <button
                  onClick={() => setTopologyView("d3")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    topologyView === "d3" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>D3 Interactive Graph</span>
                </button>

                <button
                  onClick={() => setTopologyView("cards")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    topologyView === "cards" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Card Grid</span>
                </button>
              </div>

              <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                VPC {vars.vpcCidr}
              </span>
            </div>
          </div>

          {/* D3 Topology Graph View */}
          {topologyView === "d3" ? (
            <D3TopologyGraph
              nodes={initialPipelineNodes}
              selectedNodeId={selectedNode.id}
              onSelectNode={(node) => setSelectedNode(node)}
              vars={vars}
            />
          ) : (
            /* Interactive Flow Diagram Cards */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
              {initialPipelineNodes.filter(n => n.category !== 'cicd').map((node, index) => {
                const Icon = getNodeIcon(node.category);
                const isSelected = selectedNode.id === node.id;

                return (
                  <div key={node.id} className="relative group">
                    <button
                      onClick={() => setSelectedNode(node)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 h-full flex flex-col justify-between ${
                        isSelected
                          ? "bg-slate-800/90 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-lg border ${
                            isSelected ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" : "bg-slate-800 border-slate-700 text-slate-400"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                            {node.provider}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                          {node.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                          {node.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">
                          {node.metrics.eps ? `${node.metrics.eps.toLocaleString()} EPS` : "CI/CD Gate"}
                        </span>
                        <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      </div>
                    </button>

                    {/* Flow Arrow */}
                    {index < 3 && (
                      <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-cyan-400/60">
                        <ArrowRight className="w-5 h-5 animate-pulse" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* DevSecOps CI/CD Control Plane Box */}
          <div className="border border-cyan-500/30 bg-cyan-950/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-lg">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  DevSecOps Automated CI/CD Pipeline
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">
                    CodeBuild + Checkov
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Enforces static code analysis, KMS CMK encryption checks, and mTLS configuration before auto-applying changes.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                onClick={() => {
                  const cicdNode = initialPipelineNodes.find(n => n.id === "cicd-pipeline");
                  if (cicdNode) setSelectedNode(cicdNode);
                  setShowCiCdModal(true);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/40 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md"
              >
                <Info className="w-4 h-4" />
                <span>Inspect CI/CD Spec</span>
              </button>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab("cicd")}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>CI/CD Scanner</span>
                </button>
              )}
            </div>
          </div>

          {/* Key Architecture Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-1">Mutual TLS (mTLS)</div>
              <div className="text-xs font-bold font-mono text-cyan-300">AWS ACM Private CA</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-1">State Locking</div>
              <div className="text-xs font-bold font-mono text-emerald-300">S3 + DynamoDB</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-1">Processing Engine</div>
              <div className="text-xs font-bold font-mono text-amber-300">Vector + Sigma Rules</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-1">Security Data Lake</div>
              <div className="text-xs font-bold font-mono text-purple-300">Matano Apache Iceberg</div>
            </div>
          </div>
        </div>

        {/* Selected Node Inspector Panel */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Node Security Inspector
            </h3>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded">
              {selectedNode.status.toUpperCase()}
            </span>
          </div>

          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Node Name</div>
            <div className="text-lg font-bold text-cyan-300 mt-0.5">{selectedNode.name}</div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{selectedNode.description}</p>
          </div>

          {/* Telemetry Metrics */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Node Telemetry</div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Provider:</span>
                <span className="font-semibold text-slate-200">{selectedNode.provider}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Latency:</span>
                <span className="font-semibold text-amber-300">{selectedNode.metrics.latencyMs} ms</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Encryption:</span>
                <span className="font-semibold text-cyan-300">{selectedNode.metrics.encryption}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Auth Protocol:</span>
                <span className="font-semibold text-emerald-300">{selectedNode.metrics.authMethod}</span>
              </div>
            </div>
          </div>

          {/* Security Controls List */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Enforced Security Controls
            </h4>
            <div className="space-y-2">
              {selectedNode.securityControls.map((control, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-200 font-medium">{control}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Terraform Module Link Button */}
          {onOpenTerraformModule && (
            <button
              onClick={() => {
                let mod = "networking";
                if (selectedNode.id === "msk-kafka") mod = "messaging";
                if (selectedNode.id === "vector-eks") mod = "processing";
                if (selectedNode.id === "kafka-connect") mod = "connectors";
                if (selectedNode.id === "sigma-s3") mod = "rules";
                if (selectedNode.id === "matano-s3") mod = "data_lake";
                if (selectedNode.id === "cicd-pipeline") mod = "buildspec.yml";
                onOpenTerraformModule(mod);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center justify-center space-x-2"
            >
              <FileCode2 className="w-4 h-4" />
              <span>Inspect Terraform Code for {selectedNode.name}</span>
            </button>
          )}
        </div>
      </div>

      {/* CI/CD Buildspec Modal Dialog */}
      {showCiCdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    AWS CodeBuild Specification
                    <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-700/50 px-2 py-0.5 rounded">
                      buildspec.yml
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    DevSecOps pipeline executing Checkov static analysis & tfsec before Terraform apply.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCiCdModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              {/* Checkov Security Gates Summary */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-slate-200">Enforced Gates:</span>
                  <span className="text-slate-400">CKV_AWS_116 (KMS), CKV_AWS_19 (S3 Encryption), CKV_AWS_88 (mTLS)</span>
                </div>
                <button
                  onClick={handleCopySpec}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-all text-[11px]"
                >
                  {copiedSpec ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{copiedSpec ? "Copied!" : "Copy YAML"}</span>
                </button>
              </div>

              {/* YAML Code Block */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed select-text shadow-inner">
                <pre>{buildspecContent}</pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-mono">
                Trigger: Git Push (main branch) or CodePipeline Webhook
              </div>
              <div className="flex items-center space-x-2">
                {onOpenTerraformModule && (
                  <button
                    onClick={() => {
                      setShowCiCdModal(false);
                      onOpenTerraformModule("buildspec.yml");
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <FileCode2 className="w-4 h-4" />
                    <span>Open in IaC Inspector</span>
                  </button>
                )}
                {onNavigateTab && (
                  <button
                    onClick={() => {
                      setShowCiCdModal(false);
                      onNavigateTab("cicd");
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch Live CI/CD Scanner</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
