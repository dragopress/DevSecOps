import React, { useState } from "react";
import { CustomVariables, TerraformFile } from "../types";
import { 
  Play, 
  Terminal, 
  CheckCircle2, 
  Loader2, 
  Layers, 
  RotateCcw,
  Box,
  Copy,
  Check,
  FileCode2,
  Sliders,
  Download,
  FileText,
  Clock,
  Sparkles
} from "lucide-react";

interface DeploymentSimulatorProps {
  vars: CustomVariables;
  files: TerraformFile[];
}

export const DeploymentSimulator: React.FC<DeploymentSimulatorProps> = ({
  vars
}) => {
  const [stage, setStage] = useState<"idle" | "initializing" | "planning" | "applying" | "completed">("idle");
  const [executionMode, setExecutionMode] = useState<"plan_only" | "plan_and_apply">("plan_and_apply");
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"terminal" | "diff" | "state">("terminal");
  const [copiedLog, setCopiedLog] = useState<boolean>(false);
  const [copiedState, setCopiedState] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>("");

  const runDeploymentSimulation = (mode: "plan_only" | "plan_and_apply" = executionMode) => {
    setExecutionMode(mode);
    setStage("initializing");
    setLogs([
      `[terraform init] Initializing the backend (S3 bucket: secops-tf-state-${vars.environment}-${vars.awsRegion})...`,
      `[terraform init] Initializing provider plugins...`,
      `- Finding hashicorp/aws versions matching "~> 5.0"...`,
      `- Finding hashicorp/kubernetes versions matching "~> 2.20"...`,
      `- Finding hashicorp/helm versions matching "~> 2.10"...`,
      `Installing hashicorp/aws v5.42.0...`,
      `Installing hashicorp/kubernetes v2.26.0...`,
      `Terraform backend & providers initialized successfully!`
    ]);

    // Step 2: Planning
    setTimeout(() => {
      setStage("planning");
      setLogs(prev => [
        ...prev,
        ``,
        `[terraform plan] Calculating speculative execution plan for env="${vars.environment}" in region="${vars.awsRegion}"...`,
        `+ module.networking.aws_vpc.secops_vpc (${vars.vpcCidr})`,
        `+ module.networking.aws_subnet.isolated_subnets (3x availability zones)`,
        `+ module.networking.aws_flow_log.vpc_flow_logs (S3 destination)`,
        `+ module.messaging.aws_msk_cluster.kafka_cluster (${vars.kafkaBrokerCount}x ${vars.kafkaInstanceType}, ${vars.kafkaStorageGb}GB EBS)`,
        `+ module.processing.aws_eks_cluster.secops_eks (${vars.eksNodeCount}x ${vars.eksInstanceType} nodes)`,
        `+ module.connectors.aws_mskconnect_connector.iceberg_s3_sink (topic: processed-logs)`,
        `+ module.rules.aws_s3_bucket.secops_sigma_rules (SSE-KMS encryption + IRSA Read Policy)`,
        `+ module.data_lake.aws_s3_bucket.matano_lake_storage (${vars.glacierTransitionDays}d Glacier transition / ${vars.glacierExpirationDays}d expiry)`,
        ``,
        `Plan: 28 to add, 0 to change, 0 to destroy. Speculative plan generated.`
      ]);

      if (mode === "plan_only") {
        setStage("completed");
      }
    }, 1100);

    // Step 3: Applying (if mode is plan_and_apply)
    if (mode === "plan_and_apply") {
      setTimeout(() => {
        setStage("applying");
        setLogs(prev => [
          ...prev,
          ``,
          `[terraform apply] Applying plan changes to cloud provider...`,
          `aws_kms_key.pipeline_kms: Creating... [id=arn:aws:kms:${vars.awsRegion}:123456789012:key/c82b9a71]`,
          `module.networking.aws_vpc.secops_vpc: Creating... [id=vpc-09fa8a21b-${vars.environment}]`,
          `module.networking.aws_vpc.secops_vpc: Creation complete after 6s`,
          `aws_kms_key.pipeline_kms: Creation complete after 8s`,
          `module.networking.aws_subnet.isolated[0]: Creating...`,
          `module.messaging.aws_msk_cluster.kafka_cluster: Creating... (${vars.kafkaBrokerCount} brokers)`,
          `module.messaging.aws_msk_cluster.kafka_cluster: Still creating... (10s elapsed)`,
          `module.messaging.aws_msk_cluster.kafka_cluster: Creation complete after 22s`,
          `module.processing.aws_eks_cluster.secops_eks: Creation complete after 14s (${vars.eksNodeCount} nodes)`,
          `module.connectors.aws_mskconnect_connector.iceberg_s3_sink: Creation complete after 11s`,
          `module.rules.aws_s3_bucket.secops_sigma_rules: Creation complete after 4s`,
          `module.data_lake.aws_s3_bucket.matano_lake_storage: Creation complete after 5s`,
          ``,
          `Apply complete! Resources: 28 added, 0 changed, 0 destroyed. Remote state locked and updated.`
        ]);
        setStage("completed");
      }, 2600);
    }
  };

  const handleReset = () => {
    setStage("idle");
    setLogs([]);
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n"));
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const handleCopyStateJson = () => {
    const stateData = {
      version: 4,
      terraform_version: "1.6.6",
      serial: 14,
      lineage: "8f3b2c1a-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      environment: vars.environment,
      region: vars.awsRegion,
      resources: createdResources
    };
    navigator.clipboard.writeText(JSON.stringify(stateData, null, 2));
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const createdResources = [
    { 
      name: "aws_vpc.secops_vpc", 
      type: "aws_vpc", 
      id: `vpc-09fa8a21b-${vars.environment}`, 
      region: vars.awsRegion, 
      status: "ACTIVE",
      details: `CIDR: ${vars.vpcCidr}, DNS Hostnames Enabled`
    },
    { 
      name: "aws_msk_cluster.kafka_cluster", 
      type: "aws_msk_cluster", 
      id: `arn:aws:kafka:${vars.awsRegion}:123456789012:cluster/msk-${vars.environment}`, 
      region: vars.awsRegion, 
      status: "ACTIVE",
      details: `${vars.kafkaBrokerCount}x ${vars.kafkaInstanceType}, ${vars.kafkaStorageGb}GB EBS, TLS mTLS Auth`
    },
    { 
      name: "aws_eks_cluster.secops_eks", 
      type: "aws_eks_cluster", 
      id: `arn:aws:eks:${vars.awsRegion}:123456789012:cluster/eks-${vars.environment}`, 
      region: vars.awsRegion, 
      status: "ACTIVE",
      details: `${vars.eksNodeCount}x ${vars.eksInstanceType} Nodes, IRSA Vector DaemonSet, Kubernetes v1.28`
    },
    { 
      name: "aws_mskconnect_connector.iceberg_s3_sink", 
      type: "aws_mskconnect_connector", 
      id: `arn:aws:kafkaconnect:${vars.awsRegion}:123456789012:connector/iceberg-s3-sink`, 
      region: vars.awsRegion, 
      status: "RUNNING",
      details: "Kafka Connect S3 Apache Iceberg Sink Connector (Flush interval: 300s)"
    },
    { 
      name: "aws_s3_bucket.secops_sigma_rules", 
      type: "aws_s3_bucket", 
      id: `s3://secops-${vars.environment}-sigma-rules-${vars.awsRegion}`, 
      region: vars.awsRegion, 
      status: "ACTIVE",
      details: "KMS SSE-KMS Encrypted, Versioning Enabled, Vector IRSA Read Policy"
    },
    { 
      name: "aws_s3_bucket.matano_lake_storage", 
      type: "aws_s3_bucket", 
      id: `s3://secops-${vars.environment}-lake-storage-${vars.awsRegion}`, 
      region: vars.awsRegion, 
      status: "ACTIVE",
      details: `Apache Iceberg Parquet Tables (${vars.glacierTransitionDays}d Glacier transition / ${vars.glacierExpirationDays}d expiry)`
    },
  ];

  const filteredResources = createdResources.filter(r => 
    r.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(filterQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const planDiffOutput = `# Speculative Terraform Plan Output
# Environment: ${vars.environment.toUpperCase()} | Region: ${vars.awsRegion}
# Command: terraform plan -out=tfplan

An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # module.networking.aws_vpc.secops_vpc will be created
  + resource "aws_vpc" "secops_vpc" {
      + arn                              = (known after apply)
      + cidr_block                       = "${vars.vpcCidr}"
      + enable_dns_hostnames             = true
      + enable_dns_support               = true
      + id                               = (known after apply)
      + tags                             = {
          + "Environment" = "${vars.environment}"
          + "Project"     = "${vars.projectName}"
          + "ManagedBy"   = "Terraform"
        }
    }

  # module.messaging.aws_msk_cluster.kafka_cluster will be created
  + resource "aws_msk_cluster" "kafka_cluster" {
      + cluster_name                   = "${vars.projectName}-${vars.environment}-kafka"
      + kafka_version                  = "3.5.1"
      + number_of_broker_nodes         = ${vars.kafkaBrokerCount}
      + broker_node_group_info {
          + instance_type   = "${vars.kafkaInstanceType}"
          + storage_info {
              + ebs_storage_info {
                  + volume_size = ${vars.kafkaStorageGb}
                }
            }
        }
      + encryption_info {
          + encryption_in_transit {
              + client_broker = "TLS"
              + in_cluster    = true
            }
        }
    }

  # module.processing.aws_eks_cluster.secops_eks will be created
  + resource "aws_eks_cluster" "secops_eks" {
      + name     = "${vars.projectName}-${vars.environment}-eks"
      + role_arn = "arn:aws:iam::123456789012:role/SecOpsEKSRole"
      + version  = "1.28"
      
      + vpc_config {
          + endpoint_private_access = true
          + endpoint_public_access  = false
        }
    }

  # module.processing.aws_eks_node_group.worker_nodes will be created
  + resource "aws_eks_node_group" "worker_nodes" {
      + cluster_name    = "${vars.projectName}-${vars.environment}-eks"
      + instance_types  = ["${vars.eksInstanceType}"]
      + scaling_config {
          + desired_size = ${vars.eksNodeCount}
          + max_size     = ${Math.max(vars.eksNodeCount + 2, 6)}
          + min_size     = 1
        }
    }

  # module.data_lake.aws_s3_bucket.matano_lake_storage will be created
  + resource "aws_s3_bucket" "matano_lake_storage" {
      + bucket = "secops-${vars.environment}-lake-storage-${vars.awsRegion}"
      + lifecycle_rule {
          + transition {
              + days          = ${vars.glacierTransitionDays}
              + storage_class = "GLACIER"
            }
          + expiration {
              + days = ${vars.glacierExpirationDays}
            }
        }
    }

Plan: 28 to add, 0 to change, 0 to destroy.`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-slate-200 shadow-2xl">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Interactive Terraform Deployment Simulator</h3>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
              HCL v1.6.6
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate <code className="text-cyan-300 font-mono">terraform plan</code> and <code className="text-cyan-300 font-mono">terraform apply</code> execution bound to your current dynamic variables.
          </p>
        </div>

        {/* Control Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {stage === "idle" ? (
            <>
              <button
                onClick={() => runDeploymentSimulation("plan_only")}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <FileCode2 className="w-4 h-4 text-cyan-400" />
                <span>Run Plan Only</span>
              </button>

              <button
                onClick={() => runDeploymentSimulation("plan_and_apply")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-2 shadow-lg cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run Plan & Apply</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reset Simulation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Applied Variables Snapshot Bar */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
        <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 font-bold text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Active Variable Context:
          </span>
          <span>Environment: <strong className="text-cyan-300 uppercase">{vars.environment}</strong> | Region: <strong className="text-white">{vars.awsRegion}</strong></span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 pt-1 font-mono text-[11px]">
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">VPC CIDR</span>
            <span className="text-slate-200 font-bold">{vars.vpcCidr}</span>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">MSK Kafka Brokers</span>
            <span className="text-cyan-300 font-bold">{vars.kafkaBrokerCount}x {vars.kafkaInstanceType}</span>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">EKS Node Pool</span>
            <span className="text-emerald-300 font-bold">{vars.eksNodeCount}x {vars.eksInstanceType}</span>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">EBS Kafka Storage</span>
            <span className="text-slate-200 font-bold">{vars.kafkaStorageGb} GB</span>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">Iceberg Glacier Days</span>
            <span className="text-amber-300 font-bold">{vars.glacierTransitionDays} Days</span>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">S3 Retention</span>
            <span className="text-slate-200 font-bold">{vars.glacierExpirationDays} Days</span>
          </div>
        </div>
      </div>

      {/* Execution Stepper Progress Bar */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-colors ${
          stage !== "idle" ? "bg-emerald-950/60 border-emerald-800 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-500"
        }`}>
          {stage === "initializing" ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <CheckCircle2 className="w-4 h-4" />}
          <span className="font-mono font-bold">1. terraform init</span>
        </div>

        <div className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-colors ${
          stage === "planning" || stage === "applying" || stage === "completed" ? "bg-emerald-950/60 border-emerald-800 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-500"
        }`}>
          {stage === "planning" ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <CheckCircle2 className="w-4 h-4" />}
          <span className="font-mono font-bold">2. terraform plan</span>
        </div>

        <div className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-colors ${
          stage === "applying" || (stage === "completed" && executionMode === "plan_and_apply") ? "bg-emerald-950/60 border-emerald-800 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-500"
        }`}>
          {stage === "applying" ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <CheckCircle2 className="w-4 h-4" />}
          <span className="font-mono font-bold">3. terraform apply</span>
        </div>

        <div className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-colors ${
          stage === "completed" ? "bg-emerald-900 border-emerald-600 text-emerald-200" : "bg-slate-950 border-slate-800 text-slate-500"
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-mono font-bold">4. state synchronized</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("terminal")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "terminal" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Execution Stream ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("diff")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "diff" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Speculative Plan Diff (+28)</span>
          </button>

          <button
            onClick={() => setActiveTab("state")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "state" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Created Resources Log ({createdResources.length})</span>
          </button>
        </div>

        {/* Tab-specific Quick Actions */}
        {activeTab === "terminal" && logs.length > 0 && (
          <button
            onClick={handleCopyLogs}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            {copiedLog ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedLog ? "Copied Logs" : "Copy Logs"}</span>
          </button>
        )}

        {activeTab === "state" && (
          <button
            onClick={handleCopyStateJson}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            {copiedState ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedState ? "Copied tfstate" : "Copy tfstate JSON"}</span>
          </button>
        )}
      </div>

      {/* Tab 1: Terminal Execution Stream */}
      {activeTab === "terminal" && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 h-72 overflow-y-auto space-y-1 shadow-inner select-text">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-2">
              <Play className="w-8 h-8 text-slate-700" />
              <p>Click "Run Plan Only" or "Run Plan & Apply" to simulate a real deployment execution.</p>
            </div>
          ) : (
            logs.map((log, idx) => (
              <div 
                key={idx} 
                className={
                  log.includes("Plan:") || log.includes("Apply complete!") ? "text-emerald-400 font-bold py-1" :
                  log.includes("Creating...") || log.includes("Creation complete") ? "text-cyan-300" :
                  log.includes("[terraform init]") ? "text-purple-300" :
                  log.includes("+ module.") ? "text-emerald-300 font-mono" : "text-slate-400"
                }
              >
                {log}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Speculative Plan Diff */}
      {activeTab === "diff" && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 h-72 overflow-y-auto leading-relaxed shadow-inner select-text">
          <pre className="text-emerald-400/90">{planDiffOutput}</pre>
        </div>
      )}

      {/* Tab 3: Terraform State Created Resources */}
      {activeTab === "state" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Search created resources by name, type, or ID..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2.5 max-h-64 overflow-y-auto">
            {stage !== "completed" && stage !== "applying" ? (
              <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                <Box className="w-8 h-8 text-slate-700 mx-auto" />
                <p>Run the deployment simulation to populate synchronized Terraform state resources.</p>
              </div>
            ) : (
              filteredResources.map((res, i) => (
                <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-start space-x-3">
                    <Box className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-white text-xs">{res.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {res.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{res.id}</span>
                      <p className="text-[11px] text-slate-500 mt-1">{res.details}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {res.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
