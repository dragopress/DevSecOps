export type ActiveTab = 
  | 'topology' 
  | 'terraform' 
  | 'threat-detection' 
  | 'data-lake' 
  | 'cicd' 
  | 'ai-architect';

export interface TerraformFile {
  path: string;
  name: string;
  module?: string;
  language: string;
  content: string;
  description: string;
}

export interface PipelineNode {
  id: string;
  name: string;
  category: 'edge' | 'ingestion' | 'processing' | 'datalake' | 'cicd';
  provider: 'On-Prem' | 'AWS MSK' | 'AWS EKS' | 'AWS S3/Iceberg' | 'AWS CodePipeline';
  status: 'healthy' | 'warning' | 'degraded';
  description: string;
  securityControls: string[];
  metrics: {
    eps?: number;
    latencyMs?: number;
    encryption?: string;
    authMethod?: string;
  };
  connectedTo: string[];
}

export interface SigmaRule {
  id: string;
  title: string;
  level: 'critical' | 'high' | 'medium' | 'low';
  status: 'production' | 'test' | 'experimental';
  author: string;
  logsource: {
    category?: string;
    product?: string;
    service?: string;
  };
  description: string;
  detectionYaml: string;
  sampleLogMatch: Record<string, any>;
}

export interface SecurityLogEvent {
  id: string;
  timestamp: string;
  source: 'VPC Flow' | 'CloudTrail' | 'Zeek DNS' | 'CrowdStrike' | 'Syslog';
  logPayload: Record<string, any>;
  matchedRules: string[];
  severity: 'critical' | 'high' | 'medium' | 'low' | 'clean';
  processedBy: string;
}

export interface IcebergTable {
  name: string;
  database: string;
  format: 'Apache Iceberg';
  recordCount: number;
  sizeGb: number;
  partitionFields: string[];
  schema: Array<{ field: string; type: string; description: string }>;
  sampleQueries: string[];
}

export interface SqlQueryResult {
  query: string;
  executionTimeMs: number;
  bytesScanned: string;
  snapshotId: string;
  columns: string[];
  rows: Array<Record<string, any>>;
}

export interface CheckovResult {
  checkId: string;
  checkName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  resource: string;
  file: string;
  status: 'PASSED' | 'FAILED';
  guidance: string;
}

export interface CustomVariables {
  awsRegion: string;
  environment: 'dev' | 'staging' | 'prod';
  projectName: string;
  vpcCidr: string;
  onPremCidr: string;
  kafkaInstanceType: string;
  kafkaBrokerCount: number;
  kafkaStorageGb: number;
  eksNodeCount: number;
  eksInstanceType: string;
  glacierTransitionDays: number;
  glacierExpirationDays: number;
}

export interface ProjectPackage {
  version: string;
  exportedAt: string;
  studio: string;
  pipelineConfig: CustomVariables;
  sigmaRules: SigmaRule[];
  activeRuleId?: string;
  customNotes?: string;
}

