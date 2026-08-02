import { PipelineNode, SigmaRule, SecurityLogEvent, IcebergTable, CheckovResult } from "../types";

export const initialPipelineNodes: PipelineNode[] = [
  {
    id: "edge-vector",
    name: "On-Prem Edge Forwarders",
    category: "edge",
    provider: "On-Prem",
    status: "healthy",
    description: "Fluent Bit & local Vector instances filtering local syslogs, firewalls, and endpoint beats.",
    securityControls: ["TLS 1.3 Outbound", "Local Disk Buffering", "IP Whitelisting"],
    metrics: {
      eps: 18450,
      latencyMs: 4,
      encryption: "TLS 1.3",
      authMethod: "mTLS Cert x509"
    },
    connectedTo: ["msk-kafka", "vector-eks"]
  },
  {
    id: "msk-kafka",
    name: "Amazon MSK Broker Cluster",
    category: "ingestion",
    provider: "AWS MSK",
    status: "healthy",
    description: "Managed Kafka cluster running in isolated VPC subnets with client mTLS enforcement and KMS storage encryption.",
    securityControls: ["ACM Private CA mTLS", "KMS CMK at Rest", "TLS Only (Port 9094)", "Isolated Subnets"],
    metrics: {
      eps: 18200,
      latencyMs: 12,
      encryption: "AWS KMS CMK",
      authMethod: "AWS ACM PCA mTLS"
    },
    connectedTo: ["vector-eks"]
  },
  {
    id: "vector-eks",
    name: "EKS Vector & Confluent Sigma Engine",
    category: "processing",
    provider: "AWS EKS",
    status: "healthy",
    description: "Hardened EKS cluster running Vector pods for parsing & enrichment, and Confluent Sigma engine executing live threat rules.",
    securityControls: ["IRSA (IAM Roles for Service Accounts)", "KMS Secrets Envelope Encryption", "Private API Endpoint"],
    metrics: {
      eps: 18200,
      latencyMs: 18,
      encryption: "KMS Envelope",
      authMethod: "OIDC IRSA"
    },
    connectedTo: ["matano-s3", "cloudwatch-alerts"]
  },
  {
    id: "kafka-connect",
    name: "Kafka Connect & S3 Iceberg Sink",
    category: "ingestion",
    provider: "AWS MSK",
    status: "healthy",
    description: "Managed Kafka Connect worker pool streaming processed-logs topic to secops_datalake S3 bucket in Apache Iceberg format.",
    securityControls: ["KMS CMK Data Encryption", "Glue Catalog Auto-Sync", "IAM Role Least-Privilege Policy", "VPC Private Subnets"],
    metrics: {
      eps: 18180,
      latencyMs: 22,
      encryption: "AWS KMS CMK",
      authMethod: "AWS IAM Role / IRSA"
    },
    connectedTo: ["matano-s3"]
  },
  {
    id: "sigma-s3",
    name: "S3 Sigma Rules Repository",
    category: "processing",
    provider: "AWS S3/Iceberg",
    status: "healthy",
    description: "Encrypted S3 bucket storing Sigma detection YAMLs, dynamically fetched by EKS Vector pods via IRSA and S3 sync sidecar.",
    securityControls: ["S3 Block Public Access", "KMS CMK Encryption", "IRSA Read-Only Policy", "Sidecar Watch Sync"],
    metrics: {
      eps: 0,
      latencyMs: 1,
      encryption: "KMS SSE-KMS",
      authMethod: "EKS OIDC IRSA"
    },
    connectedTo: ["vector-eks"]
  },
  {
    id: "matano-s3",
    name: "Matano S3 Apache Iceberg Data Lake",
    category: "datalake",
    provider: "AWS S3/Iceberg",
    status: "healthy",
    description: "Open-source Matano security data lake storing raw and normalized logs in S3 Apache Iceberg format with Glue Data Catalog.",
    securityControls: ["S3 Block Public Access", "KMS SSE-KMS Mandatory", "Glacier Lifecycle Rules", "S3 Bucket Policies"],
    metrics: {
      eps: 18180,
      latencyMs: 45,
      encryption: "KMS SSE-KMS",
      authMethod: "IAM Least-Privilege"
    },
    connectedTo: []
  },
  {
    id: "cicd-pipeline",
    name: "AWS CodePipeline & CodeBuild",
    category: "cicd",
    provider: "AWS CodePipeline",
    status: "healthy",
    description: "DevSecOps CI/CD running Checkov, tfsec, and terraform validate/plan/apply with manual approval gates.",
    securityControls: ["Checkov Static Scanner", "KMS Artifact Encryption", "IAM Least-Privilege Execution"],
    metrics: {
      latencyMs: 0,
      encryption: "KMS CMK",
      authMethod: "AWS IAM Role"
    },
    connectedTo: ["msk-kafka", "vector-eks", "matano-s3"]
  }
];

export const defaultSigmaRules: SigmaRule[] = [
  {
    id: "rule-ssh-bruteforce",
    title: "SSH Brute Force Attack Detected",
    level: "high",
    status: "production",
    author: "SecOps Threat Team",
    logsource: {
      category: "auth",
      product: "linux",
      service: "sshd"
    },
    description: "Detects multiple failed SSH authentication attempts from a single IP address within a short timeframe.",
    detectionYaml: `title: SSH Brute Force Authentication
id: f4a88398-31bc-49e0-8a18-d018bf14352f
status: production
logsource:
  category: authentication
  product: linux
  service: sshd
detection:
  selection:
    event_id: "Failed password"
  condition: selection | count() > 5 by src_ip
level: high`,
    sampleLogMatch: {
      timestamp: new Date().toISOString(),
      event_id: "Failed password",
      src_ip: "198.51.100.44",
      user: "root",
      auth_method: "password",
      port: 22,
      service: "sshd"
    }
  },
  {
    id: "rule-cobalt-strike-dns",
    title: "Cobalt Strike DNS Beaconing Pattern",
    level: "critical",
    status: "production",
    author: "Detection Engineering",
    logsource: {
      category: "dns",
      product: "zeek",
      service: "dns"
    },
    description: "Detects high-frequency TXT/A queries matching known Cobalt Strike malleable C2 DNS profiles.",
    detectionYaml: `title: Cobalt Strike C2 DNS Tunneling
id: a8c2019b-2200-4e31-901d-55198bc72101
status: production
logsource:
  category: dns
  product: zeek
detection:
  selection:
    qtype_name: ["TXT", "A"]
    query|contains:
      - "stage."
      - "cdn-update."
      - "c2.malware-cnc.com"
  condition: selection
level: critical`,
    sampleLogMatch: {
      timestamp: new Date().toISOString(),
      query: "stage.1a2b3c.c2.malware-cnc.com",
      qtype_name: "TXT",
      client_ip: "10.100.10.88",
      dns_response: "192.0.2.1",
      ttl: 30
    }
  },
  {
    id: "rule-iam-privilege-escalation",
    title: "AWS IAM Policy AttachToUser Escalation",
    level: "high",
    status: "production",
    author: "Cloud DevSecOps",
    logsource: {
      service: "cloudtrail",
      product: "aws"
    },
    description: "Detects AttachUserPolicy or CreateAccessKey calls targeting admin privileges from unapproved credentials.",
    detectionYaml: `title: AWS IAM Privilege Escalation
id: 991823ab-2001-44ee-b12a-00192837462a
status: production
logsource:
  service: cloudtrail
  product: aws
detection:
  selection:
    eventName:
      - "AttachUserPolicy"
      - "AttachRolePolicy"
      - "CreateAccessKey"
    policyArn|contains: "AdministratorAccess"
  condition: selection
level: high`,
    sampleLogMatch: {
      eventTime: new Date().toISOString(),
      eventName: "AttachUserPolicy",
      eventSource: "iam.amazonaws.com",
      policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
      userName: "dev-temp-user",
      sourceIPAddress: "203.0.113.89"
    }
  },
  {
    id: "rule-s3-bulk-download",
    title: "Suspicious S3 Bucket Data Exfiltration",
    level: "high",
    status: "production",
    author: "Cloud SecOps",
    logsource: {
      service: "s3",
      product: "aws"
    },
    description: "Detects anomalous rate of GetObject requests from external IP address targeting classified S3 buckets.",
    detectionYaml: `title: S3 Data Exfiltration Detection
id: c19283a0-1283-4921-b019-123982371239
status: production
logsource:
  service: s3
  product: aws
detection:
  selection:
    eventName: "GetObject"
    bucketName|contains: "lake-storage"
  condition: selection | count() > 100 by sourceIPAddress
level: high`,
    sampleLogMatch: {
      eventTime: new Date().toISOString(),
      eventName: "GetObject",
      bucketName: "secops-pipeline-prod-lake-storage",
      key: "vpc_flow/year=2026/month=08/day=01/data.parquet",
      sourceIPAddress: "198.51.100.99"
    }
  }
];

export const sampleLogEvents: SecurityLogEvent[] = [
  {
    id: "log-101",
    timestamp: "04:07:12.100",
    source: "Zeek DNS",
    logPayload: {
      query: "stage.1a2b3c.c2.malware-cnc.com",
      qtype_name: "TXT",
      client_ip: "10.100.10.88",
      dns_response: "192.0.2.1",
      ttl: 30
    },
    matchedRules: ["rule-cobalt-strike-dns"],
    severity: "critical",
    processedBy: "Vector Node #2 -> Sigma Engine"
  },
  {
    id: "log-102",
    timestamp: "04:07:11.850",
    source: "CloudTrail",
    logPayload: {
      eventTime: "2026-08-01T04:07:11Z",
      eventName: "AttachUserPolicy",
      eventSource: "iam.amazonaws.com",
      policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
      userName: "dev-temp-user",
      sourceIPAddress: "203.0.113.89"
    },
    matchedRules: ["rule-iam-privilege-escalation"],
    severity: "high",
    processedBy: "Vector Node #1 -> Sigma Engine"
  },
  {
    id: "log-103",
    timestamp: "04:07:10.500",
    source: "Syslog",
    logPayload: {
      event_id: "Failed password",
      src_ip: "198.51.100.44",
      user: "root",
      auth_method: "password",
      port: 22,
      service: "sshd"
    },
    matchedRules: ["rule-ssh-bruteforce"],
    severity: "high",
    processedBy: "Vector Node #3 -> Sigma Engine"
  },
  {
    id: "log-104",
    timestamp: "04:07:09.120",
    source: "VPC Flow",
    logPayload: {
      src_ip: "10.100.20.15",
      dst_ip: "10.100.10.4",
      src_port: 49210,
      dst_port: 9094,
      protocol: "TCP",
      bytes: 14200,
      action: "ACCEPT"
    },
    matchedRules: [],
    severity: "clean",
    processedBy: "Vector Node #1 -> Matano Ingestion"
  },
  {
    id: "log-105",
    timestamp: "04:07:08.400",
    source: "CrowdStrike",
    logPayload: {
      process_name: "powershell.exe",
      command_line: "powershell.exe -e a3lsbCBzeXN0ZW0=",
      parent_process: "cmd.exe",
      user: "SYSTEM",
      agent_id: "cs-agent-9912"
    },
    matchedRules: [],
    severity: "medium",
    processedBy: "Vector Node #2 -> Sigma Engine"
  }
];

export const icebergTables: IcebergTable[] = [
  {
    name: "vpc_flow_logs",
    database: "secops_pipeline_prod_matano_db",
    format: "Apache Iceberg",
    recordCount: 4289100,
    sizeGb: 14.8,
    partitionFields: ["year", "month", "day", "action"],
    schema: [
      { field: "ts", type: "TIMESTAMP", description: "Event timestamp UTC" },
      { field: "src_addr", type: "STRING", description: "Source IPv4/v6 address" },
      { field: "dst_addr", type: "STRING", description: "Destination IPv4/v6 address" },
      { field: "src_port", type: "INT", description: "Source TCP/UDP port" },
      { field: "dst_port", type: "INT", description: "Destination TCP/UDP port" },
      { field: "packets", type: "LONG", description: "Total packets transmitted" },
      { field: "bytes", type: "LONG", description: "Total bytes transmitted" },
      { field: "action", type: "STRING", description: "ACCEPT or REJECT" }
    ],
    sampleQueries: [
      "SELECT src_addr, count(*) as reject_count FROM vpc_flow_logs WHERE action = 'REJECT' GROUP BY src_addr ORDER BY reject_count DESC LIMIT 10;",
      "SELECT date_trunc('hour', ts) as hr, sum(bytes)/1024/1024 as total_mb FROM vpc_flow_logs GROUP BY 1 ORDER BY 1 DESC LIMIT 24;"
    ]
  },
  {
    name: "cloudtrail_events",
    database: "secops_pipeline_prod_matano_db",
    format: "Apache Iceberg",
    recordCount: 894100,
    sizeGb: 3.2,
    partitionFields: ["year", "month", "eventsource"],
    schema: [
      { field: "eventtime", type: "TIMESTAMP", description: "AWS API call timestamp" },
      { field: "eventsource", type: "STRING", description: "AWS service (e.g. s3, iam, ec2)" },
      { field: "eventname", type: "STRING", description: "API Action name" },
      { field: "awsregion", type: "STRING", description: "AWS Region" },
      { field: "sourceipaddress", type: "STRING", description: "Caller IP address" },
      { field: "useragent", type: "STRING", description: "HTTP User Agent" },
      { field: "useridentity_arn", type: "STRING", description: "IAM Identity ARN" }
    ],
    sampleQueries: [
      "SELECT eventname, count(*) as call_count FROM cloudtrail_events WHERE eventsource = 'iam.amazonaws.com' GROUP BY eventname ORDER BY call_count DESC;",
      "SELECT sourceipaddress, eventname, useridentity_arn FROM cloudtrail_events WHERE eventname IN ('AttachUserPolicy', 'CreateAccessKey') ORDER BY eventtime DESC LIMIT 20;"
    ]
  },
  {
    name: "zeek_dns_logs",
    database: "secops_pipeline_prod_matano_db",
    format: "Apache Iceberg",
    recordCount: 12400300,
    sizeGb: 28.5,
    partitionFields: ["year", "month", "day"],
    schema: [
      { field: "ts", type: "TIMESTAMP", description: "Query timestamp" },
      { field: "client_ip", type: "STRING", description: "Internal client host IP" },
      { field: "query", type: "STRING", description: "Requested DNS domain query" },
      { field: "qtype_name", type: "STRING", description: "Record type (A, AAAA, TXT, MX)" },
      { field: "dns_response", type: "STRING", description: "Resolved IP address" }
    ],
    sampleQueries: [
      "SELECT query, count(*) as freq FROM zeek_dns_logs WHERE qtype_name = 'TXT' GROUP BY query HAVING count(*) > 50 ORDER BY freq DESC;",
      "SELECT client_ip, query FROM zeek_dns_logs WHERE query LIKE '%.malware-cnc.com' LIMIT 15;"
    ]
  }
];

export const checkovResults: CheckovResult[] = [
  {
    checkId: "CKV_AWS_116",
    checkName: "Ensure KMS key rotation is enabled",
    severity: "HIGH",
    resource: "aws_kms_key.flow_logs_kms",
    file: "modules/networking/main.tf",
    status: "PASSED",
    guidance: "enable_key_rotation set to true for auto 365-day rotation."
  },
  {
    checkId: "CKV_AWS_19",
    checkName: "Ensure all data stored in S3 is encrypted at rest using KMS",
    severity: "HIGH",
    resource: "aws_s3_bucket.secops_datalake",
    file: "modules/data_lake/main.tf",
    status: "PASSED",
    guidance: "SSE-KMS bucket default encryption enforced with CMK."
  },
  {
    checkId: "CKV_AWS_144",
    checkName: "Ensure S3 bucket has Cross-Region Replication enabled",
    severity: "LOW",
    resource: "aws_s3_bucket.secops_datalake",
    file: "modules/data_lake/main.tf",
    status: "PASSED",
    guidance: "Lifecycle rule configured for Glacier transition at 90 days."
  },
  {
    checkId: "CKV_AWS_88",
    checkName: "Ensure MSK Cluster transit encryption enforces TLS only",
    severity: "CRITICAL",
    resource: "aws_msk_cluster.kafka",
    file: "modules/messaging/main.tf",
    status: "PASSED",
    guidance: "client_broker set to TLS. Unencrypted port 9092 disabled."
  },
  {
    checkId: "CKV_AWS_39",
    checkName: "Ensure EKS API endpoint is private and not exposed publicly",
    severity: "HIGH",
    resource: "aws_eks_cluster.processing_cluster",
    file: "modules/processing/main.tf",
    status: "PASSED",
    guidance: "endpoint_public_access = false, endpoint_private_access = true."
  },
  {
    checkId: "CKV_AWS_108",
    checkName: "Ensure Kafka Connect IAM Policy enforces KMS & S3 least-privilege",
    severity: "HIGH",
    resource: "aws_iam_policy.kafka_connect_s3_kms_policy",
    file: "modules/kafka_connect/main.tf",
    status: "PASSED",
    guidance: "IAM policy scoped exclusively to secops_datalake bucket ARN and CMK key."
  },
  {
    checkId: "CKV_AWS_145",
    checkName: "Ensure Sigma Rules S3 Bucket has KMS Encryption and Public Block Enabled",
    severity: "HIGH",
    resource: "aws_s3_bucket.secops_sigma_rules",
    file: "modules/sigma_rules/main.tf",
    status: "PASSED",
    guidance: "SSE-KMS key enforced & block_public_acls set to true."
  }
];
