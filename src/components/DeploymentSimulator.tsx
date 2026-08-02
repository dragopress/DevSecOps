import React, { useState } from "react";
import { CustomVariables, TerraformFile } from "../types";
import { 
  Play, 
  Terminal, 
  CheckCircle2, 
  Loader2, 
  Server, 
  Layers, 
  ShieldCheck, 
  Check, 
  RotateCcw,
  Box,
  Key,
  Globe,
  Database
} from "lucide-react";

interface DeploymentSimulatorProps {
  vars: CustomVariables;
  files: TerraformFile[];
}

export const DeploymentSimulator: React.FC<DeploymentSimulatorProps> = ({
  vars,
  files
}) => {
  const [stage, setStage] = useState<"idle" | "initializing" | "planning" | "applying" | "completed">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"terminal" | "state">("terminal");

  const runDeploymentSimulation = () => {
    setStage("initializing");
    setLogs([
      `Initializing the backend...`,
      `Initializing provider plugins...`,
      `- Finding hashicorp/aws versions matching "~> 5.0"...`,
      `- Finding hashicorp/kubernetes versions matching "~> 2.20"...`,
      `- Finding hashicorp/helm versions matching "~> 2.10"...`,
      `Installing hashicorp/aws v5.42.0...`,
      `Installing hashicorp/kubernetes v2.26.0...`,
      `Terraform has been successfully initialized!`
    ]);

    // Step 2: Planning
    setTimeout(() => {
      setStage("planning");
      setLogs(prev => [
        ...prev,
        ``,
        `[terraform plan] Calculating speculative execution plan...`,
        `[module.networking] Planning aws_vpc.secops_vpc (${vars.vpcCidr}) in ${vars.awsRegion}...`,
        `[module.networking] Planning 3x aws_subnet.isolated_subnets...`,
        `[module.messaging] Planning aws_msk_cluster.kafka_cluster (${vars.kafkaBrokerCount}x ${vars.kafkaInstanceType})...`,
        `[module.processing] Planning aws_eks_cluster.secops_eks (${vars.eksNodeCount}x ${vars.eksInstanceType})...`,
        `[module.connectors] Planning aws_mskconnect_connector.iceberg_s3_sink (processed-logs topic)...`,
        `[module.rules] Planning aws_s3_bucket.secops_sigma_rules (KMS SSE-KMS + IRSA Policy)...`,
        `[module.data_lake] Planning aws_s3_bucket.matano_lake_storage (${vars.glacierTransitionDays}d Glacier transition)...`,
        ``,
        `Plan: 28 to add, 0 to change, 0 to destroy.`
      ]);
    }, 1200);

    // Step 3: Applying
    setTimeout(() => {
      setStage("applying");
      setLogs(prev => [
        ...prev,
        ``,
        `[terraform apply] Applying changes...`,
        `aws_kms_key.pipeline_kms: Creating... [id=arn:aws:kms:${vars.awsRegion}:123456789012:key/c82b9a71]`,
        `aws_vpc.secops_vpc: Creating... [id=vpc-09fa8a21b${vars.environment}]`,
        `aws_vpc.secops_vpc: Creation complete after 6s`,
        `aws_kms_key.pipeline_kms: Creation complete after 8s`,
        `module.networking.aws_subnet.isolated[0]: Creating...`,
        `module.messaging.aws_msk_cluster.kafka_cluster: Creating...`,
        `module.messaging.aws_msk_cluster.kafka_cluster: Still creating... (10s elapsed)`,
        `module.messaging.aws_msk_cluster.kafka_cluster: Still creating... (20s elapsed)`,
        `module.messaging.aws_msk_cluster.kafka_cluster: Creation complete after 24s`,
        `module.processing.aws_eks_cluster.secops_eks: Creation complete after 15s`,
        `module.connectors.aws_mskconnect_connector.iceberg_s3_sink: Creation complete after 12s`,
        `module.rules.aws_s3_bucket.secops_sigma_rules: Creation complete after 4s`,
        `module.data_lake.aws_s3_bucket.matano_lake_storage: Creation complete after 5s`,
        ``,
        `Apply complete! Resources: 28 added, 0 changed, 0 destroyed.`
      ]);
      setStage("completed");
    }, 2800);
  };

  const handleReset = () => {
    setStage("idle");
    setLogs([]);
  };

  const createdResources = [
    { name: "aws_vpc.secops_vpc", type: "VPC", id: `vpc-09fa8a21b-${vars.environment}`, region: vars.awsRegion, status: "Active" },
    { name: "aws_msk_cluster.kafka_cluster", type: "Amazon MSK", id: `arn:aws:kafka:${vars.awsRegion}:123456789012:cluster/msk-${vars.environment}`, region: vars.awsRegion, status: "Provisioned (mTLS)" },
    { name: "aws_eks_cluster.secops_eks", type: "Amazon EKS", id: `arn:aws:eks:${vars.awsRegion}:123456789012:cluster/eks-${vars.environment}`, region: vars.awsRegion, status: "Active (Private API)" },
    { name: "aws_mskconnect_connector.iceberg_s3_sink", type: "Kafka Connect", id: `arn:aws:kafkaconnect:${vars.awsRegion}:123456789012:connector/iceberg-s3-sink`, region: vars.awsRegion, status: "RUNNING" },
    { name: "aws_s3_bucket.secops_sigma_rules", type: "S3 Bucket", id: `s3://secops-${vars.environment}-sigma-rules`, region: vars.awsRegion, status: "Encrypted (KMS)" },
    { name: "aws_s3_bucket.matano_lake_storage", type: "S3 Apache Iceberg", id: `s3://secops-${vars.environment}-lake-storage`, region: vars.awsRegion, status: "Encrypted (Glacier)" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-slate-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Interactive Deployment Simulator</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate <code className="text-cyan-300 font-mono">terraform plan</code> and <code className="text-cyan-300 font-mono">terraform apply</code> execution against your customized variables.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {stage === "idle" ? (
            <button
              onClick={runDeploymentSimulation}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-2 shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Terraform Plan & Apply</span>
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset State</span>
            </button>
          )}
        </div>
      </div>

      {/* Execution Stepper Progress Bar */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
          stage !== "idle" ? "bg-emerald-950/60 border-emerald-800 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-500"
        }`}>
          {stage === "initializing" ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <CheckCircle2 className="w-4 h-4" />}
          <span className="font-mono font-bold">1. init</span>
        </div>

        <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
          stage === "planning" || stage === "applying" || stage === "completed" ? "bg-emerald-950/60 border-emerald-800 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-500"
        }`}>
          {stage === "planning" ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <CheckCircle2 className="w-4 h-4" />}
          <span className="font-mono font-bold">2. plan</span>
        </div>

        <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
          stage === "applying" || stage === "completed" ? "bg-emerald-950/60 border-emerald-800 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-500"
        }`}>
          {stage === "applying" ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <CheckCircle2 className="w-4 h-4" />}
          <span className="font-mono font-bold">3. apply</span>
        </div>

        <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
          stage === "completed" ? "bg-emerald-900 border-emerald-600 text-emerald-200" : "bg-slate-950 border-slate-800 text-slate-500"
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-mono font-bold">4. state saved</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("terminal")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
            activeTab === "terminal" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Execution Stream ({logs.length} events)</span>
        </button>

        <button
          onClick={() => setActiveTab("state")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
            activeTab === "state" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Terraform State Resources ({createdResources.length})</span>
        </button>
      </div>

      {/* Tab 1: Terminal Log Window */}
      {activeTab === "terminal" && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 h-64 overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-2">
              <Play className="w-8 h-8 text-slate-700" />
              <p>Click "Run Terraform Plan & Apply" to simulate a live deployment stream.</p>
            </div>
          ) : (
            logs.map((log, idx) => (
              <div 
                key={idx} 
                className={
                  log.includes("Plan:") || log.includes("Apply complete!") ? "text-emerald-400 font-bold py-1" :
                  log.includes("Creating...") || log.includes("Creation complete") ? "text-cyan-300" :
                  log.includes("Initializing") ? "text-purple-300" : "text-slate-400"
                }
              >
                {log}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Terraform State Resources */}
      {activeTab === "state" && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 max-h-64 overflow-y-auto">
          {stage !== "completed" ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              Run deployment simulation to generate active state resources.
            </div>
          ) : (
            createdResources.map((res, i) => (
              <div key={i} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <Box className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="font-mono font-bold text-white block">{res.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{res.id}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                    {res.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    {res.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
