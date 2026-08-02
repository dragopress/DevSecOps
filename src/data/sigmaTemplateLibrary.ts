import { SigmaRule } from "../types";

export interface SigmaTemplate extends SigmaRule {
  categoryName: string;
  mitreAttackId?: string;
  tags: string[];
}

export const sigmaTemplateLibrary: SigmaTemplate[] = [
  {
    id: "template-ssh-bruteforce",
    title: "SSH Brute-Force Password Attack",
    level: "high",
    status: "production",
    author: "SOC Analytics",
    categoryName: "Brute Force & Authentication",
    mitreAttackId: "T1110.001",
    tags: ["Brute Force", "SSH", "Linux", "Authentication"],
    logsource: {
      category: "auth",
      product: "linux",
      service: "sshd"
    },
    description: "Detects multiple SSH password authentication failures from a single IP within a short timeframe, indicating automated credential stuffing or brute-force.",
    detectionYaml: `title: SSH Brute-Force Password Attack
id: c9281a02-1102-4f81-801a-229182371234
status: production
description: Detects repeated SSH authentication failures from external IP sources.
author: SOC Analytics
date: '2026-08-02'
logsource:
  category: auth
  product: linux
  service: sshd
detection:
  selection:
    event_id: "Failed password"
    service: "sshd"
    auth_method: "password"
  condition: selection | count() > 5 by src_ip
falsepositives:
  - Misconfigured automated deployment script or broken SSH credentials
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
    id: "template-unauthorized-api-access",
    title: "AWS CloudTrail Unauthorized API Access Spike",
    level: "high",
    status: "production",
    author: "Cloud SecOps",
    categoryName: "Cloud API & Auth",
    mitreAttackId: "T1078.004",
    tags: ["AWS", "CloudTrail", "Unauthorized API", "AccessDenied"],
    logsource: {
      service: "cloudtrail",
      product: "aws",
      category: "security"
    },
    description: "Detects repeated AccessDenied or UnauthorizedOperation API calls in AWS CloudTrail, indicating token enumeration or compromised credential testing.",
    detectionYaml: `title: AWS CloudTrail Unauthorized API Access Spike
id: b8810293-9012-4211-a881-001293812733
status: production
description: Identifies spikes in AccessDenied and UnauthorizedOperation responses across AWS IAM principals.
author: Cloud SecOps
date: '2026-08-02'
logsource:
  service: cloudtrail
  product: aws
detection:
  selection:
    errorCode:
      - "AccessDenied"
      - "UnauthorizedOperation"
  condition: selection | count() > 10 by userIdentity.arn
falsepositives:
  - Automated deployment pipeline with stale IAM permissions
level: high`,
    sampleLogMatch: {
      eventTime: new Date().toISOString(),
      eventName: "ListBuckets",
      errorCode: "AccessDenied",
      errorMessage: "User is not authorized to perform: s3:ListAllMyBuckets",
      sourceIPAddress: "203.0.113.195",
      userIdentity: {
        arn: "arn:aws:iam::123456789012:user/contractor-temp"
      }
    }
  },
  {
    id: "template-iam-privilege-escalation",
    title: "AWS IAM Policy AttachToUser Privilege Escalation",
    level: "critical",
    status: "production",
    author: "Cloud DevSecOps",
    categoryName: "Cloud API & Auth",
    mitreAttackId: "T1098.001",
    tags: ["IAM", "AWS", "Privilege Escalation", "AdminAccess"],
    logsource: {
      service: "cloudtrail",
      product: "aws"
    },
    description: "Detects AttachUserPolicy or CreateAccessKey API calls attaching AdministratorAccess or creating secondary access keys.",
    detectionYaml: `title: AWS IAM Policy AttachToUser Privilege Escalation
id: 991823ab-2001-44ee-b12a-00192837462a
status: production
description: Detects unauthorized elevation of IAM user or role rights to AdministratorAccess.
author: Cloud DevSecOps
date: '2026-08-02'
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
falsepositives:
  - Legitimate Terraform deployment by DevSecOps CI/CD runner
level: critical`,
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
    id: "template-root-login-no-mfa",
    title: "AWS Console Root Account Login Without MFA",
    level: "critical",
    status: "production",
    author: "Cloud Threat Lead",
    categoryName: "Cloud API & Auth",
    mitreAttackId: "T1078.004",
    tags: ["AWS", "Root Account", "Console", "MFA"],
    logsource: {
      service: "cloudtrail",
      product: "aws"
    },
    description: "Triggers immediate critical alert whenever AWS Root user logs into AWS Management Console without Multi-Factor Authentication.",
    detectionYaml: `title: AWS Console Root Account Login Without MFA
id: e4819201-3821-4122-9012-001293812111
status: production
description: Alerts on AWS Root Account console login events missing MFA enforcement.
author: Cloud Threat Lead
date: '2026-08-02'
logsource:
  service: cloudtrail
  product: aws
detection:
  selection:
    eventName: "ConsoleLogin"
    userIdentity.type: "Root"
    mfaUsed: "false"
  condition: selection
falsepositives:
  - Initial AWS account bootstrap (should still use MFA)
level: critical`,
    sampleLogMatch: {
      eventTime: new Date().toISOString(),
      eventName: "ConsoleLogin",
      userIdentity: {
        type: "Root",
        principalId: "123456789012"
      },
      mfaUsed: "false",
      sourceIPAddress: "198.51.100.22"
    }
  },
  {
    id: "template-cobalt-strike-dns",
    title: "Cobalt Strike C2 DNS Tunneling & Beaconing",
    level: "critical",
    status: "production",
    author: "Detection Engineering",
    categoryName: "Network & DNS Threat",
    mitreAttackId: "T1071.004",
    tags: ["DNS", "Zeek", "Cobalt Strike", "C2"],
    logsource: {
      category: "dns",
      product: "zeek",
      service: "dns"
    },
    description: "Detects high-frequency TXT/A queries with staged base64 subdomains matching known Cobalt Strike malleable C2 profiles.",
    detectionYaml: `title: Cobalt Strike C2 DNS Tunneling
id: a8c2019b-2200-4e31-901d-55198bc72101
status: production
description: Detects DNS TXT record tunneling associated with C2 beaconing.
author: Detection Engineering
date: '2026-08-02'
logsource:
  category: dns
  product: zeek
detection:
  selection:
    qtype_name:
      - "TXT"
      - "A"
    query|contains:
      - "stage."
      - "cdn-update."
      - "c2.malware-cnc.com"
  condition: selection
falsepositives:
  - Legitimate DNS TXT record lookups for SPF or DKIM validation
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
    id: "template-dns-tunneling-high-entropy",
    title: "High Entropy DNS TXT Exfiltration",
    level: "high",
    status: "production",
    author: "Network SecOps",
    categoryName: "Network & DNS Threat",
    mitreAttackId: "T1048.003",
    tags: ["DNS", "Exfiltration", "Zeek", "Entropy"],
    logsource: {
      category: "dns",
      product: "zeek"
    },
    description: "Detects anomalous length and encoded subdomains in DNS TXT queries used for covert data exfiltration.",
    detectionYaml: `title: High Entropy DNS TXT Exfiltration
id: f1029302-8812-4012-9012-123019283012
status: production
description: Identifies large TXT query domain prefixes carrying encoded payloads.
author: Network SecOps
date: '2026-08-02'
logsource:
  category: dns
  product: zeek
detection:
  selection:
    qtype_name: "TXT"
    query|contains:
      - ".exfil."
      - "==.data."
  condition: selection
falsepositives:
  - Antivirus domain reputation checks
level: high`,
    sampleLogMatch: {
      timestamp: new Date().toISOString(),
      query: "a3a1f89c00e12d.exfil.domain.com",
      qtype_name: "TXT",
      client_ip: "10.100.10.105"
    }
  },
  {
    id: "template-k8s-pod-exec",
    title: "Kubernetes API Pod Exec into Privileged Container",
    level: "high",
    status: "production",
    author: "Container SecOps",
    categoryName: "Kubernetes & Container",
    mitreAttackId: "T1613",
    tags: ["Kubernetes", "Pod Exec", "EKS", "Container"],
    logsource: {
      product: "kubernetes",
      service: "audit"
    },
    description: "Detects interactive shell execution (kubectl exec / pods/exec) into production or kube-system pods.",
    detectionYaml: `title: Kubernetes API Pod Exec into Privileged Container
id: d1029381-1920-4019-9281-001293810293
status: production
description: Alerts when an interactive terminal session is opened inside a running Kubernetes pod.
author: Container SecOps
date: '2026-08-02'
logsource:
  product: kubernetes
  service: audit
detection:
  selection:
    objectRef.resource: "pods"
    objectRef.subresource: "exec"
    verb: "create"
  filter_namespace:
    objectRef.namespace:
      - "kube-system"
      - "secops-pipeline"
  condition: selection and filter_namespace
falsepositives:
  - Authorized SRE debugging session during incident response
level: high`,
    sampleLogMatch: {
      stage: "ResponseComplete",
      verb: "create",
      objectRef: {
        resource: "pods",
        subresource: "exec",
        namespace: "kube-system",
        name: "aws-node-7b92x"
      },
      user: {
        username: "developer-service-account"
      }
    }
  },
  {
    id: "template-s3-bulk-download",
    title: "Suspicious S3 Bucket Data Exfiltration",
    level: "high",
    status: "production",
    author: "Cloud SecOps",
    categoryName: "S3 & Data Exfiltration",
    mitreAttackId: "T1567",
    tags: ["S3", "Data Lake", "Exfiltration", "AWS"],
    logsource: {
      service: "s3",
      product: "aws"
    },
    description: "Detects anomalous rate of GetObject requests from external IP addresses targeting classified data lake S3 buckets.",
    detectionYaml: `title: Suspicious S3 Bucket Data Exfiltration
id: c19283a0-1283-4921-b019-123982371239
status: production
description: Detects bulk GetObject requests indicating potential data exfiltration from security data lake buckets.
author: Cloud SecOps
date: '2026-08-02'
logsource:
  service: s3
  product: aws
detection:
  selection:
    eventName: "GetObject"
    bucketName|contains: "lake-storage"
  condition: selection | count() > 100 by sourceIPAddress
falsepositives:
  - Batch ETL data ingestion or Athena/DuckDB analytical queries
level: high`,
    sampleLogMatch: {
      eventTime: new Date().toISOString(),
      eventName: "GetObject",
      bucketName: "secops-pipeline-prod-lake-storage",
      key: "vpc_flow/year=2026/month=08/day=01/data.parquet",
      sourceIPAddress: "198.51.100.99"
    }
  },
  {
    id: "template-vss-deletion-ransomware",
    title: "Windows Volume Shadow Copy Deletion (VSS)",
    level: "critical",
    status: "production",
    author: "Endpoint Threat Team",
    categoryName: "Endpoint & Ransomware",
    mitreAttackId: "T1490",
    tags: ["Ransomware", "VSS", "vssadmin", "Windows"],
    logsource: {
      category: "process_creation",
      product: "windows"
    },
    description: "Detects vssadmin.exe, wmic.exe, or bcdedit commands commonly executed by ransomware to delete backup shadow copies prior to encryption.",
    detectionYaml: `title: Windows Volume Shadow Copy Deletion
id: 3b102931-8812-4102-8812-901238102938
status: production
description: Detects command-line execution targeting volume shadow copy deletion.
author: Endpoint Threat Team
date: '2026-08-02'
logsource:
  category: process_creation
  product: windows
detection:
  selection_vss:
    Image|endswith: "\\vssadmin.exe"
    CommandLine|contains:
      - "delete"
      - "shadows"
  selection_wmic:
    Image|endswith: "\\wmic.exe"
    CommandLine|contains: "shadowcopy delete"
  condition: selection_vss or selection_wmic
falsepositives:
  - Legacy backup software cleanup operations
level: critical`,
    sampleLogMatch: {
      timestamp: new Date().toISOString(),
      Image: "C:\\Windows\\System32\\vssadmin.exe",
      CommandLine: "vssadmin.exe Delete Shadows /All /Quiet",
      User: "NT AUTHORITY\\SYSTEM",
      ProcessId: 4892
    }
  }
];
