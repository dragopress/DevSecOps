import React, { useState } from "react";
import JSZip from "jszip";
import { CustomVariables, TerraformFile } from "../types";
import { getTerraformFiles } from "../data/terraformFiles";
import { InfrastructurePolicyCheck } from "./InfrastructurePolicyCheck";
import { DeploymentSimulator } from "./DeploymentSimulator";
import { 
  Folder, 
  FileText, 
  Copy, 
  Check, 
  Sliders, 
  Download, 
  Code2, 
  Terminal,
  ShieldCheck,
  ChevronRight,
  Archive,
  Loader2,
  ShieldAlert,
  Play
} from "lucide-react";

interface TerraformInspectorProps {
  vars: CustomVariables;
  setVars: React.Dispatch<React.SetStateAction<CustomVariables>>;
  initialFile?: string;
}

export const TerraformInspector: React.FC<TerraformInspectorProps> = ({
  vars,
  setVars,
  initialFile
}) => {
  const terraformFiles = getTerraformFiles(vars);
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    initialFile ? (terraformFiles.find(f => f.path.includes(initialFile))?.path || terraformFiles[0].path) : terraformFiles[0].path
  );
  const [copied, setCopied] = useState(false);
  const [showVarEditor, setShowVarEditor] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [viewMode, setViewMode] = useState<"code" | "policy" | "simulator">("code");

  const selectedFile = terraformFiles.find((f) => f.path === selectedFilePath) || terraformFiles[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Bundle every Terraform file into zip maintaining exact folder hierarchy
      terraformFiles.forEach(f => {
        zip.file(f.path, f.content);
      });

      // Add project README with deployment instructions
      const readme = `# AWS SecOps Ingestion & Detection Pipeline Infrastructure
Environment: ${vars.environment.toUpperCase()}
AWS Region: ${vars.awsRegion}

## Included Infrastructure Modules:
1. \`main.tf\`, \`variables.tf\`, \`outputs.tf\` - Root orchestrator module
2. \`modules/networking/\` - VPC, isolated subnets, VPC Flow Logs
3. \`modules/messaging/\` - Amazon MSK Kafka Cluster with TLS mTLS
4. \`modules/processing/\` - Amazon EKS Cluster, Vector DaemonSet, IRSA
5. \`modules/connectors/\` - Kafka Connect & Apache Iceberg S3 Sink Connector
6. \`modules/rules/\` - S3 Sigma Detection Rules Bucket & IRSA Read Policy
7. \`modules/data_lake/\` - S3 Iceberg Data Lake & Glue Data Catalog

## How to Deploy:
\`\`\`bash
# 1. Initialize backend and provider plugins
terraform init

# 2. Generate and inspect deployment plan
terraform plan -out=tfplan

# 3. Apply infrastructure
terraform apply tfplan
\`\`\`
`;
      zip.file("README.md", readme);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `secops-terraform-workspace-${vars.environment}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error creating ZIP archive:", err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadAll = () => {
    const textData = terraformFiles.map(f => `// ==========================================\n// FILE: ${f.path}\n// ==========================================\n\n${f.content}\n\n`).join("\n");
    const blob = new Blob([textData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `secops-terraform-pipeline-${vars.environment}.tf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group files by module
  const rootFiles = terraformFiles.filter(f => !f.module);
  const modules = Array.from(new Set(terraformFiles.filter(f => f.module).map(f => f.module as string)));

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            Infrastructure-as-Code (Terraform Repository)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Production-ready modular HCL codebase with S3 state backend, DynamoDB locks, mTLS, and Checkov policy enforcement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl mr-2">
            <button
              onClick={() => setViewMode("code")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === "code" 
                  ? "bg-blue-600 text-white font-bold shadow-xs" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>HCL Code</span>
            </button>

            <button
              onClick={() => setViewMode("policy")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === "policy" 
                  ? "bg-purple-600 text-white font-bold shadow-xs" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>CIS Policy Audit</span>
            </button>

            <button
              onClick={() => setViewMode("simulator")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === "simulator" 
                  ? "bg-emerald-600 text-white font-bold shadow-xs" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Plan Simulator</span>
            </button>
          </div>

          {/* Variable Customizer Toggle */}
          <button
            onClick={() => setShowVarEditor(!showVarEditor)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
              showVarEditor 
                ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Customize Variables</span>
          </button>

          {/* Download Configuration (ZIP) */}
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-2 shadow-md"
            title="Download full modular directory as a ZIP workspace archive"
          >
            {isZipping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
            <span>Download Configuration (ZIP)</span>
          </button>

          {/* Single File Export */}
          <button
            onClick={handleDownloadAll}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-xl transition-all flex items-center space-x-1.5"
            title="Export as single combined .tf text file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Single File</span>
          </button>
        </div>
      </div>

      {/* Variable Customization Drawer */}
      {showVarEditor && (
        <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Dynamic Variable Configurator (Updates Terraform Code Live)
            </h3>
            <span className="text-xs text-slate-400">Environment: <strong className="text-white uppercase">{vars.environment}</strong></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">AWS Region</label>
              <input
                type="text"
                value={vars.awsRegion}
                onChange={(e) => setVars(prev => ({ ...prev, awsRegion: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">VPC CIDR</label>
              <input
                type="text"
                value={vars.vpcCidr}
                onChange={(e) => setVars(prev => ({ ...prev, vpcCidr: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">MSK Broker Instance</label>
              <select
                value={vars.kafkaInstanceType}
                onChange={(e) => setVars(prev => ({ ...prev, kafkaInstanceType: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              >
                <option value="kafka.m5.large">kafka.m5.large (2 vCPU, 8GB)</option>
                <option value="kafka.m5.xlarge">kafka.m5.xlarge (4 vCPU, 16GB)</option>
                <option value="kafka.m5.2xlarge">kafka.m5.2xlarge (8 vCPU, 32GB)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Kafka Broker Count</label>
              <input
                type="number"
                min={2}
                max={12}
                value={vars.kafkaBrokerCount}
                onChange={(e) => setVars(prev => ({ ...prev, kafkaBrokerCount: parseInt(e.target.value) || 3 }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">EKS Worker Node Count</label>
              <input
                type="number"
                min={1}
                max={20}
                value={vars.eksNodeCount}
                onChange={(e) => setVars(prev => ({ ...prev, eksNodeCount: parseInt(e.target.value) || 3 }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">EKS Instance Type</label>
              <input
                type="text"
                value={vars.eksInstanceType}
                onChange={(e) => setVars(prev => ({ ...prev, eksInstanceType: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">S3 Glacier Archival (Days)</label>
              <input
                type="number"
                value={vars.glacierTransitionDays}
                onChange={(e) => setVars(prev => ({ ...prev, glacierTransitionDays: parseInt(e.target.value) || 90 }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Data Lake Retention (Days)</label>
              <input
                type="number"
                value={vars.glacierExpirationDays}
                onChange={(e) => setVars(prev => ({ ...prev, glacierExpirationDays: parseInt(e.target.value) || 365 }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mode View Routing */}
      {viewMode === "policy" && (
        <InfrastructurePolicyCheck 
          files={terraformFiles} 
          vars={vars} 
          onSelectFile={(path) => {
            setSelectedFilePath(path);
            setViewMode("code");
          }} 
        />
      )}

      {viewMode === "simulator" && (
        <DeploymentSimulator 
          vars={vars} 
          files={terraformFiles} 
        />
      )}

      {/* File Explorer & Code Viewer Grid */}
      {viewMode === "code" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Tree Explorer */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 uppercase tracking-wider px-2 border-b border-slate-100 pb-2">
            <Folder className="w-4 h-4 text-blue-600" />
            <span>Repository Directory</span>
          </div>

          <div className="space-y-1 text-xs">
            {/* Root Files */}
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Root Configuration</div>
              {rootFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left px-3 py-2 rounded-lg font-mono flex items-center justify-between transition-all ${
                    selectedFilePath === file.path
                      ? "bg-blue-50 text-blue-700 border border-blue-200 font-bold"
                      : "text-slate-700 hover:bg-slate-100/70"
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${selectedFilePath === file.path ? "text-blue-600" : "opacity-0"}`} />
                </button>
              ))}
            </div>

            {/* Modules Folders */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider">Feature Modules</div>
              {modules.map((mod) => {
                const modFiles = terraformFiles.filter((f) => f.module === mod);
                return (
                  <div key={mod} className="space-y-0.5">
                    <div className="flex items-center space-x-1.5 px-2 py-1 text-slate-800 font-mono font-bold">
                      <Folder className="w-3.5 h-3.5 text-amber-600" />
                      <span>modules/{mod}/</span>
                    </div>

                    <div className="pl-4 space-y-0.5 border-l border-slate-200 ml-3">
                      {modFiles.map((file) => (
                        <button
                          key={file.path}
                          onClick={() => setSelectedFilePath(file.path)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg font-mono flex items-center justify-between text-[11px] transition-all ${
                            selectedFilePath === file.path
                              ? "bg-blue-50 text-blue-700 border border-blue-200 font-bold"
                              : "text-slate-700 hover:bg-slate-100/70"
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 truncate">
                            <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="lg:col-span-8 bg-[#1F2937] border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            {/* Header of Code Pane */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-sm font-bold text-white">{selectedFile.path}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedFile.language}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedFile.description}</p>
              </div>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 self-start sm:self-auto"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy File"}</span>
              </button>
            </div>

            {/* Syntax Highlighted Code Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed max-h-[580px] overflow-y-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {selectedFile.content.split("\n").map((line, index) => (
                    <tr key={index} className="hover:bg-slate-800/40">
                      <td className="select-none text-right pr-4 text-slate-600 w-10 font-mono text-[11px]">
                        {index + 1}
                      </td>
                      <td className="whitespace-pre">
                        <span className={
                          line.trim().startsWith("#") ? "text-slate-500 italic" :
                          line.includes("resource") || line.includes("module") || line.includes("variable") || line.includes("output") ? "text-cyan-300 font-semibold" :
                          line.includes("=") ? "text-slate-200" : "text-slate-300"
                        }>
                          {line}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Checkov & tfsec Compliant Architecture
            </span>
            <span className="font-mono">{selectedFile.content.split("\n").length} lines</span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
