import React, { useState, useEffect } from "react";
import { ActiveTab, CustomVariables, SigmaRule, ProjectPackage } from "./types";
import { defaultSigmaRules } from "./data/mockSecurityData";
import { Header } from "./components/Header";
import { ArchitectureTopology } from "./components/ArchitectureTopology";
import { TerraformInspector } from "./components/TerraformInspector";
import { ThreatDetectionSandbox } from "./components/ThreatDetectionSandbox";
import { DataLakeWorkbench } from "./components/DataLakeWorkbench";
import { CiCdScanner } from "./components/CiCdScanner";
import { ServicesExplorer } from "./components/ServicesExplorer";
import { EnterpriseSaaSControlPlane } from "./components/EnterpriseSaaSControlPlane";
import { MartechCommerceModule } from "./components/MartechCommerceModule";
import { WorkspaceLowCodeModule } from "./components/WorkspaceLowCodeModule";
import { CybersecurityEndpointModule } from "./components/CybersecurityEndpointModule";
import { DevOpsAiOpsModule } from "./components/DevOpsAiOpsModule";
import { EnterpriseDataAnalyticsModule } from "./components/EnterpriseDataAnalyticsModule";
import { AccessControlPanel } from "./components/AccessControlPanel";
import { AiArchitect } from "./components/AiArchitect";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("topology");
  const [selectedTerraformModule, setSelectedTerraformModule] = useState<string | undefined>();
  const [liveEps, setLiveEps] = useState<number>(18450);

  const [vars, setVars] = useState<CustomVariables>({
    awsRegion: "us-east-1",
    environment: "prod",
    projectName: "secops-pipeline",
    vpcCidr: "10.100.0.0/16",
    onPremCidr: "172.16.0.0/12",
    kafkaInstanceType: "kafka.m5.large",
    kafkaBrokerCount: 3,
    kafkaStorageGb: 250,
    eksNodeCount: 3,
    eksInstanceType: "m6i.xlarge",
    glacierTransitionDays: 90,
    glacierExpirationDays: 365
  });

  const [rules, setRules] = useState<SigmaRule[]>(defaultSigmaRules);

  const handleImportPackage = (importedData: ProjectPackage) => {
    if (importedData.pipelineConfig) {
      setVars(prev => ({
        ...prev,
        ...importedData.pipelineConfig
      }));
    }
    const loadedRules = importedData.sigmaRules || (importedData as any).rules;
    if (loadedRules && Array.isArray(loadedRules) && loadedRules.length > 0) {
      setRules(loadedRules);
    }
  };

  // Dynamic live EPS variance
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveEps(prev => prev + Math.floor((Math.random() - 0.5) * 120));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenTerraformModule = (moduleName: string) => {
    setSelectedTerraformModule(moduleName);
    setActiveTab("terraform");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        vars={vars}
        setVars={setVars}
        liveEps={liveEps}
        rules={rules}
        setRules={setRules}
        onImportPackage={handleImportPackage}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "topology" && (
          <ArchitectureTopology
            vars={vars}
            onOpenTerraformModule={handleOpenTerraformModule}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "terraform" && (
          <TerraformInspector
            vars={vars}
            setVars={setVars}
            initialFile={selectedTerraformModule}
          />
        )}

        {activeTab === "threat-detection" && (
          <ThreatDetectionSandbox
            rules={rules}
            setRules={setRules}
            vars={vars}
            onImportPackage={handleImportPackage}
          />
        )}

        {activeTab === "data-lake" && (
          <DataLakeWorkbench />
        )}

        {activeTab === "cicd" && (
          <CiCdScanner />
        )}

        {activeTab === "services" && (
          <ServicesExplorer />
        )}

        {activeTab === "saas-architecture" && (
          <EnterpriseSaaSControlPlane />
        )}

        {activeTab === "martech-commerce" && (
          <MartechCommerceModule />
        )}

        {activeTab === "workspace-lowcode" && (
          <WorkspaceLowCodeModule />
        )}

        {activeTab === "cybersecurity-endpoint" && (
          <CybersecurityEndpointModule />
        )}

        {activeTab === "devops-aiops" && (
          <DevOpsAiOpsModule />
        )}

        {activeTab === "enterprise-data-analytics" && (
          <EnterpriseDataAnalyticsModule />
        )}

        {activeTab === "access-control" && (
          <AccessControlPanel />
        )}

        {activeTab === "ai-architect" && (
          <AiArchitect vars={vars} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            DevSecOps Cloud Security Data Pipeline Studio — Decoupled Open-Source Architecture
          </div>
          <div className="font-mono text-slate-600">
            AWS MSK | EKS Vector & Sigma | Matano S3 Iceberg | Checkov
          </div>
        </div>
      </footer>
    </div>
  );
}

