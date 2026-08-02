import { TerraformFile, CustomVariables } from "../types";

export function getTerraformFiles(vars: CustomVariables): TerraformFile[] {
  return [
    {
      path: "providers.tf",
      name: "providers.tf",
      language: "hcl",
      description: "AWS Provider, required terraform versions, default tags, and S3/DynamoDB state backend configuration.",
      content: `terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # S3 and DynamoDB State Backend Configuration
  backend "s3" {
    bucket         = "tf-state-${vars.projectName}-${vars.environment}-${vars.awsRegion}"
    key            = "core/terraform.tfstate"
    region         = "${vars.awsRegion}"
    dynamodb_table = "tf-locks-${vars.projectName}"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project      = var.project_name
      Environment  = var.environment
      ManagedBy    = "Terraform"
      SecurityZone = "CyberDataPipeline"
    }
  }
}`
    },
    {
      path: "variables.tf",
      name: "variables.tf",
      language: "hcl",
      description: "Core project input variables with strict validation rules.",
      content: `variable "aws_region" {
  type        = string
  description = "AWS Region for infrastructure deployment"
  default     = "${vars.awsRegion}"
}

variable "environment" {
  type        = string
  description = "Deployment environment (dev, staging, prod)"
  default     = "${vars.environment}"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "project_name" {
  type        = string
  description = "Project name prefix for resource naming"
  default     = "${vars.projectName}"
}

variable "enable_auto_apply" {
  type        = bool
  description = "If true, CodePipeline will automatically apply Terraform changes upon approval"
  default     = false
}`
    },
    {
      path: "main.tf",
      name: "main.tf",
      language: "hcl",
      description: "Root module linking networking, messaging (MSK), processing (EKS), data lake (Matano S3 Iceberg), Kafka Connect, and Sigma Rules storage.",
      content: `# ------------------------------------------------------------------------------
# Customer Managed Key (CMK) for CI/CD and Pipeline Artifact Encryption
# ------------------------------------------------------------------------------
resource "aws_kms_key" "pipeline_kms_key" {
  description             = "KMS Key for SecOps CI/CD Artifacts and Logs"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "\${var.project_name}-pipeline-kms"
  }
}

# ------------------------------------------------------------------------------
# Module 1: Secure Network Infrastructure
# ------------------------------------------------------------------------------
module "networking" {
  source = "./modules/networking"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = "${vars.vpcCidr}"
  single_nat_gateway = var.environment == "prod" ? false : true
  on_prem_cidr       = "${vars.onPremCidr}"
}

# ------------------------------------------------------------------------------
# Module 2: Cloud Ingestion (Amazon MSK + mTLS)
# ------------------------------------------------------------------------------
module "messaging" {
  source = "./modules/messaging"

  project_name           = var.project_name
  environment            = var.environment
  vpc_id                 = module.networking.vpc_id
  isolated_subnet_ids    = module.networking.isolated_subnet_ids
  msk_security_group_id  = module.networking.msk_security_group_id
  kafka_instance_type    = "${vars.kafkaInstanceType}"
  number_of_broker_nodes = ${vars.kafkaBrokerCount}
  ebs_volume_size        = ${vars.kafkaStorageGb}
}

# ------------------------------------------------------------------------------
# Module 3: Stream Processing & Sigma Engine (EKS)
# ------------------------------------------------------------------------------
module "processing" {
  source = "./modules/processing"

  project_name             = var.project_name
  environment              = var.environment
  vpc_id                   = module.networking.vpc_id
  processing_subnet_ids    = module.networking.processing_subnet_ids
  vector_security_group_id = module.networking.vector_processing_security_group_id
  kubernetes_version       = "1.30"
  desired_node_count       = ${vars.eksNodeCount}
}

# ------------------------------------------------------------------------------
# Module 4: Security Data Lake (Matano + Apache Iceberg on S3)
# ------------------------------------------------------------------------------
module "data_lake" {
  source = "./modules/data_lake"

  project_name          = var.project_name
  environment           = var.environment
  vector_irsa_role_name = split("/", module.processing.vector_irsa_role_arn)[1]

  raw_logs_transition_days = ${vars.glacierTransitionDays}
  raw_logs_expiration_days = ${vars.glacierExpirationDays}
}

# ------------------------------------------------------------------------------
# Module 5: Kafka Connect Workers & Apache Iceberg S3 Sink Connector
# ------------------------------------------------------------------------------
module "kafka_connect" {
  source = "./modules/connectors"

  project_name              = var.project_name
  environment               = var.environment
  aws_region                = var.aws_region
  datalake_s3_bucket_arn    = module.data_lake.s3_bucket_arn
  datalake_s3_bucket_name   = "\${var.project_name}-\${var.environment}-lake-storage"
  datalake_kms_key_arn      = module.data_lake.kms_key_arn
  msk_bootstrap_brokers_tls = module.messaging.bootstrap_brokers_tls
  isolated_subnet_ids       = module.networking.isolated_subnet_ids
  msk_security_group_id     = module.networking.msk_security_group_id
}

# ------------------------------------------------------------------------------
# Module 6: Sigma Detection Rules S3 Bucket & Vector IRSA Integration
# ------------------------------------------------------------------------------
module "sigma_rules" {
  source = "./modules/rules"

  project_name          = var.project_name
  environment           = var.environment
  vector_irsa_role_name = split("/", module.processing.vector_irsa_role_arn)[1]
}`
    },
    {
      path: "outputs.tf",
      name: "outputs.tf",
      language: "hcl",
      description: "Root level outputs exposing VPC, MSK brokers, EKS, Data Lake, Kafka Connect, and Sigma Rules S3 Bucket.",
      content: `output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.networking.vpc_id
}

output "msk_bootstrap_brokers_tls" {
  description = "mTLS Bootstrap brokers connection string for MSK"
  value       = module.messaging.bootstrap_brokers_tls
}

output "eks_cluster_endpoint" {
  description = "Private API endpoint for EKS processing cluster"
  value       = module.processing.cluster_endpoint
}

output "datalake_s3_bucket_arn" {
  description = "ARN of the S3 Apache Iceberg Data Lake Bucket"
  value       = module.data_lake.s3_bucket_arn
}

output "glue_database_name" {
  description = "Matano AWS Glue Data Catalog Database Name"
  value       = module.data_lake.glue_database_name
}

output "kafka_connect_connector_arn" {
  description = "ARN of the MSK Connect S3 Iceberg Sink Connector"
  value       = module.kafka_connect.connector_arn
}

output "sigma_rules_s3_bucket_arn" {
  description = "ARN of the S3 Bucket storing Sigma Rule YAML files"
  value       = module.sigma_rules.s3_bucket_arn
}

output "vector_sigma_rules_iam_policy_arn" {
  description = "IAM Policy ARN granting EKS Vector IRSA role read access to S3 Sigma rules"
  value       = module.sigma_rules.vector_iam_policy_arn
}`
    },
    {
      path: "buildspec.yml",
      name: "buildspec.yml",
      language: "yaml",
      description: "AWS CodeBuild spec executing Checkov static security analysis, terraform validate/fmt/plan/apply.",
      content: `version: 0.2

env:
  variables:
    TF_VERSION: "1.6.6"
    CHECKOV_VERSION: "3.2.0"

phases:
  install:
    runtime-versions:
      python: 3.11
    commands:
      - echo "Installing Terraform \${TF_VERSION}..."
      - wget -q https://releases.hashicorp.com/terraform/\${TF_VERSION}/terraform_\${TF_VERSION}_linux_amd64.zip
      - unzip terraform_\${TF_VERSION}_linux_amd64.zip && mv terraform /usr/local/bin/
      - echo "Installing Checkov Security Scanner..."
      - pip install checkov==\${CHECKOV_VERSION}

  pre_build:
    commands:
      - echo "Checking Terraform Formatting..."
      - terraform fmt -check -recursive
      - echo "Running Static Infrastructure Security Analysis (Checkov)..."
      - checkov --directory . --framework terraform --skip-download --soft-fail-on HIGH --hard-fail-on CRITICAL

  build:
    commands:
      - echo "Initializing Terraform..."
      - terraform init
      - echo "Validating Terraform Syntax..."
      - terraform validate
      - echo "Creating Infrastructure Plan..."
      - terraform plan -out=tfplan -no-color

  post_build:
    commands:
      - echo "Checking build outcome..."
      - |
        if [ "$CODEBUILD_BUILD_SUCCEEDED" -eq 1 ] && [ "$EXECUTE_APPLY" = "true" ]; then
          echo "Applying Terraform Changes..."
          terraform apply -auto-approve tfplan
        else
          echo "Terraform plan phase complete. Pending manual approval or skipped auto-apply."
        fi

artifacts:
  files:
    - tfplan
    - "**/*"
  name: secops-terraform-pipeline-artifacts`
    },
    {
      path: "modules/networking/main.tf",
      name: "main.tf",
      module: "networking",
      language: "hcl",
      description: "VPC, flow logs KMS, public/processing/isolated subnets, NAT Gateways, and baseline Security Groups.",
      content: `# ------------------------------------------------------------------------------
# 1. KMS Key for VPC Flow Logs
# ------------------------------------------------------------------------------
resource "aws_kms_key" "flow_logs_kms" {
  description             = "KMS Key for VPC Flow Logs encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "\${var.project_name}-\${var.environment}-flowlogs-kms"
  }
}

resource "aws_cloudwatch_log_group" "flow_logs" {
  name              = "/aws/vpc-flow-logs/\${var.project_name}-\${var.environment}"
  retention_in_days = 90
  kms_key_id        = aws_kms_key.flow_logs_kms.arn

  tags = {
    Name = "\${var.project_name}-\${var.environment}-vpc-flow-logs"
  }
}

# ------------------------------------------------------------------------------
# 2. VPC & Flow Logs
# ------------------------------------------------------------------------------
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "\${var.project_name}-\${var.environment}-vpc"
  }
}

resource "aws_flow_log" "vpc_flow_log" {
  iam_role_arn    = aws_iam_role.flow_logs_role.arn
  log_destination = aws_cloudwatch_log_group.flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id
}

resource "aws_iam_role" "flow_logs_role" {
  name = "\${var.project_name}-\${var.environment}-vpc-flowlogs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "vpc-flow-logs.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "flow_logs_policy" {
  name = "\${var.project_name}-\${var.environment}-vpc-flowlogs-policy"
  role = aws_iam_role.flow_logs_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ]
      Resource = "\${aws_cloudwatch_log_group.flow_logs.arn}:*"
    }]
  })
}

# ------------------------------------------------------------------------------
# 3. Subnets (Public, Processing, Isolated)
# ------------------------------------------------------------------------------
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "\${var.project_name}-\${var.environment}-public-subnet-\${count.index + 1}"
    Type = "Public"
  }
}

resource "aws_subnet" "processing" {
  count             = length(var.processing_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.processing_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name                              = "\${var.project_name}-\${var.environment}-processing-subnet-\${count.index + 1}"
    Type                              = "PrivateProcessing"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

resource "aws_subnet" "isolated" {
  count             = length(var.isolated_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.isolated_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "\${var.project_name}-\${var.environment}-isolated-subnet-\${count.index + 1}"
    Type = "IsolatedData"
  }
}

# ------------------------------------------------------------------------------
# 4. Core Security Groups (Least Privilege Baseline)
# ------------------------------------------------------------------------------
resource "aws_security_group" "msk_sg" {
  name        = "\${var.project_name}-\${var.environment}-msk-sg"
  description = "Security group for MSK Cluster accepting mTLS log streams"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "mTLS log ingress from Stream Processing layer"
    from_port       = 9094
    to_port         = 9094
    protocol        = "tcp"
    security_groups = [aws_security_group.vector_processing_sg.id]
  }

  ingress {
    description = "mTLS log ingress direct from On-Premises Edge"
    from_port   = 9094
    to_port     = 9094
    protocol    = "tcp"
    cidr_blocks = [var.on_prem_cidr]
  }

  egress {
    description = "Allow internal intra-cluster node communication"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  tags = {
    Name = "\${var.project_name}-\${var.environment}-msk-sg"
  }
}

resource "aws_security_group" "vector_processing_sg" {
  name        = "\${var.project_name}-\${var.environment}-vector-processing-sg"
  description = "Security group for Vector Stream Processing & Sigma Detection Nodes"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "mTLS log intake from On-Premises Vector edge nodes"
    from_port   = 6000
    to_port     = 6000
    protocol    = "tcp"
    cidr_blocks = [var.on_prem_cidr]
  }

  egress {
    description = "Allow outgoing traffic to AWS services and MSK"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "\${var.project_name}-\${var.environment}-vector-processing-sg"
  }
}`
    },
    {
      path: "modules/messaging/main.tf",
      name: "main.tf",
      module: "messaging",
      language: "hcl",
      description: "Amazon MSK Kafka Cluster with mTLS auth (AWS Private CA), CMK encryption at rest, and TLS forced in transit.",
      content: `# ------------------------------------------------------------------------------
# 1. KMS Encryption Key for Kafka Storage
# ------------------------------------------------------------------------------
resource "aws_kms_key" "msk_kms" {
  description             = "KMS Key for MSK Storage Encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "\${var.project_name}-\${var.environment}-msk-kms"
  }
}

# ------------------------------------------------------------------------------
# 2. AWS Private CA for mTLS Authentication
# ------------------------------------------------------------------------------
resource "aws_acmpca_certificate_authority" "msk_ca" {
  type = "ROOT"

  certificate_authority_configuration {
    key_algorithm     = "RSA_2048"
    signing_algorithm = "SHA256WITHRSA"

    subject {
      common_name  = "\${var.project_name}-\${var.environment}-msk-root-ca"
      organization = "SecOps-CyberDataPipeline"
    }
  }

  permanent_deletion_time_in_days = 7

  tags = {
    Name = "\${var.project_name}-\${var.environment}-msk-ca"
  }
}

resource "aws_acmpca_certificate" "msk_ca_cert" {
  certificate_authority_arn   = aws_acmpca_certificate_authority.msk_ca.arn
  certificate_signing_request = aws_acmpca_certificate_authority.msk_ca.certificate_signing_request
  signing_algorithm           = "SHA256WITHRSA"
  template_arn                = "arn:aws:acm-pca:::template/RootCACertificate/V1"

  validity {
    type  = "YEARS"
    value = 10
  }
}

resource "aws_acmpca_certificate_authority_certificate" "msk_ca_activation" {
  certificate_authority_arn = aws_acmpca_certificate_authority.msk_ca.arn
  certificate               = aws_acmpca_certificate.msk_ca_cert.certificate
}

# ------------------------------------------------------------------------------
# 3. Amazon MSK Cluster
# ------------------------------------------------------------------------------
resource "aws_msk_cluster" "kafka" {
  cluster_name           = "\${var.project_name}-\${var.environment}-msk"
  kafka_version          = var.kafka_version
  number_of_broker_nodes = var.number_of_broker_nodes

  broker_node_group_info {
    instance_type   = var.kafka_instance_type
    client_subnets  = var.isolated_subnet_ids
    security_groups = [var.msk_security_group_id]

    storage_info {
      ebs_storage_info {
        volume_size = var.ebs_volume_size
      }
    }
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
    encryption_at_rest_kms_key_arn = aws_kms_key.msk_kms.arn
  }

  client_authentication {
    tls {
      certificate_authority_arns = [aws_acmpca_certificate_authority.msk_ca.arn]
    }
  }

  enhanced_monitoring = "PER_TOPIC_PER_BROKER"

  tags = {
    Name = "\${var.project_name}-\${var.environment}-msk-cluster"
  }

  depends_on = [aws_acmpca_certificate_authority_certificate.msk_ca_activation]
}`
    },
    {
      path: "modules/processing/main.tf",
      name: "main.tf",
      module: "processing",
      language: "hcl",
      description: "Hardened EKS Cluster with Secrets KMS Envelope Encryption, IRSA roles, and Vector/Sigma worker nodes.",
      content: `# ------------------------------------------------------------------------------
# 1. KMS Key for EKS Secrets Encryption
# ------------------------------------------------------------------------------
resource "aws_kms_key" "eks_kms" {
  description             = "KMS Key for EKS Cluster Secrets Encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "\${var.project_name}-\${var.environment}-eks-kms"
  }
}

# ------------------------------------------------------------------------------
# 2. Amazon EKS Cluster
# ------------------------------------------------------------------------------
resource "aws_eks_cluster" "processing_cluster" {
  name     = "\${var.project_name}-\${var.environment}-eks"
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids              = var.processing_subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = false
    security_group_ids      = [var.vector_security_group_id]
  }

  encryption_config {
    provider {
      key_arn = aws_kms_key.eks_kms.arn
    }
    resources = ["secrets"]
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  tags = {
    Name = "\${var.project_name}-\${var.environment}-eks"
  }
}

# ------------------------------------------------------------------------------
# 3. IRSA Role for Vector Pods (Access MSK + S3 Security Lake)
# ------------------------------------------------------------------------------
resource "aws_iam_role" "vector_irsa_role" {
  name = "\${var.project_name}-\${var.environment}-vector-irsa-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.eks_oidc.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "\${replace(aws_iam_openid_connect_provider.eks_oidc.url, "https://", "")}:sub" = "system:serviceaccount:secops-processing:vector-sa"
        }
      }
    }]
  })
}`
    },
    {
      path: "modules/data_lake/main.tf",
      name: "main.tf",
      module: "data_lake",
      language: "hcl",
      description: "Matano Open-Source Security Lake: S3 bucket, Glacier lifecycle policy, Glue Catalog, and KMS encryption.",
      content: `# ------------------------------------------------------------------------------
# 1. KMS Key for Data Lake S3 & Glue Encryption
# ------------------------------------------------------------------------------
resource "aws_kms_key" "datalake_kms" {
  description             = "KMS Key for Security Data Lake S3 bucket and Glue metadata"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "\${var.project_name}-\${var.environment}-datalake-kms"
  }
}

# ------------------------------------------------------------------------------
# 2. S3 Bucket for Matano Apache Iceberg Data Lake
# ------------------------------------------------------------------------------
resource "aws_s3_bucket" "secops_datalake" {
  bucket        = "\${var.project_name}-\${var.environment}-lake-storage"
  force_destroy = false

  tags = {
    Name         = "\${var.project_name}-\${var.environment}-lake-storage"
    SecurityZone = "SecurityDataLake"
  }
}

resource "aws_s3_bucket_public_access_block" "public_block" {
  bucket = aws_s3_bucket.secops_datalake.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "lifecycle" {
  bucket = aws_s3_bucket.secops_datalake.id

  rule {
    id     = "archive-old-security-events"
    status = "Enabled"

    transition {
      days          = var.raw_logs_transition_days
      storage_class = "GLACIER_FLEXIBLE_RETRIEVAL"
    }

    expiration {
      days = var.raw_logs_expiration_days
    }
  }
}

# ------------------------------------------------------------------------------
# 3. AWS Glue Data Catalog (Apache Iceberg Catalog Database)
# ------------------------------------------------------------------------------
resource "aws_glue_catalog_database" "matano_catalog" {
  name        = "\${var.project_name}_\${var.environment}_matano_db"
  description = "Matano Apache Iceberg Database storing security log tables (e.g., vpc_flow, cloudtrail, zeek, crowdstrike)"
}`
    },
    {
      path: "modules/connectors/main.tf",
      name: "main.tf",
      module: "connectors",
      language: "hcl",
      description: "Kafka Connect Worker & Apache Iceberg S3 Sink Connector with IAM roles, KMS decrypt, and Glue catalog sync.",
      content: `# ------------------------------------------------------------------------------
# Kafka Connect Worker Cluster & Apache Iceberg S3 Sink Connector
# ------------------------------------------------------------------------------

# 1. IAM Role & Security Policy for Kafka Connect Worker (Access S3 & KMS)
resource "aws_iam_role" "kafka_connect_role" {
  name = "\${var.project_name}-\${var.environment}-kafka-connect-irsa-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "kafkaconnect.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Name = "\${var.project_name}-\${var.environment}-kafka-connect-role"
  }
}

resource "aws_iam_policy" "kafka_connect_s3_kms_policy" {
  name        = "\${var.project_name}-\${var.environment}-kafka-connect-s3-kms-policy"
  description = "Allows Kafka Connect Apache Iceberg Sink worker to read/write S3 data lake & decrypt KMS keys"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:AbortMultipartUpload",
          "s3:ListBucketMultipartUploads",
          "s3:ListMultipartUploadParts"
        ]
        Resource = "\${var.datalake_s3_bucket_arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = var.datalake_s3_bucket_arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:GenerateDataKey",
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:DescribeKey"
        ]
        Resource = var.datalake_kms_key_arn
      },
      {
        Effect = "Allow"
        Action = [
          "glue:GetDatabase",
          "glue:GetDatabases",
          "glue:GetTable",
          "glue:GetTables",
          "glue:CreateTable",
          "glue:UpdateTable",
          "glue:BatchCreatePartition"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "kafka_connect_attach" {
  role       = aws_iam_role.kafka_connect_role.name
  policy_arn = aws_iam_policy.kafka_connect_s3_kms_policy.arn
}

# 2. Apache Iceberg Custom MSK Connect Plugin
resource "aws_mskconnect_custom_plugin" "iceberg_plugin" {
  name         = "\${var.project_name}-\${var.environment}-iceberg-sink-plugin"
  content_type = "ZIP"
  description  = "Tabular / Apache Iceberg Kafka Connect S3 Sink Plugin v0.6.1"

  location {
    s3_bucket_location {
      bucket_arn = var.datalake_s3_bucket_arn
      file_key   = "plugins/iceberg-kafka-connect-0.6.1.zip"
    }
  }
}

# 3. MSK Connect S3 Iceberg Sink Connector Resource
resource "aws_mskconnect_connector" "iceberg_s3_sink" {
  name                 = "\${var.project_name}-\${var.environment}-iceberg-s3-sink"
  kafkaconnect_version = "2.7.1"
  service_execution_role_arn = aws_iam_role.kafka_connect_role.arn

  capacity {
    autoscaling {
      mcu_count        = 1
      min_worker_count = 2
      max_worker_count = 8

      scale_in_policy {
        cpu_utilization_percentage = 20
      }
      scale_out_policy {
        cpu_utilization_percentage = 80
      }
    }
  }

  connector_configuration = {
    "connector.class"               = "io.tabular.iceberg.connect.IcebergSinkConnector"
    "tasks.max"                     = "4"
    "topics"                        = "processed-logs"
    "iceberg.catalog.type"          = "glue"
    "iceberg.catalog.glue.id"       = var.aws_account_id
    "iceberg.tables"                = "secops_pipeline_prod_matano_db.processed_logs"
    "iceberg.tables.auto-create"    = "true"
    "iceberg.tables.evolve-schema"  = "true"
    "iceberg.control.commit.interval-ms" = "60000"
    "s3.bucket"                     = var.datalake_s3_bucket_name
    "s3.endpoint"                   = "https://s3.\${var.aws_region}.amazonaws.com"
    "kms.key.id"                    = var.datalake_kms_key_arn
  }

  kafka_cluster {
    apache_kafka_cluster {
      bootstrap_servers = var.msk_bootstrap_brokers_tls

      vpc {
        subnets         = var.isolated_subnet_ids
        security_groups = [var.msk_security_group_id]
      }
    }
  }

  kafka_cluster_client_authentication {
    authentication_type = "TLS"
  }

  kafka_cluster_encryption_in_transit {
    encryption_type = "TLS"
  }

  plugin {
    custom_plugin {
      arn      = aws_mskconnect_custom_plugin.iceberg_plugin.arn
      revision = aws_mskconnect_custom_plugin.iceberg_plugin.latest_revision
    }
  }
}`
    },
    {
      path: "modules/rules/main.tf",
      name: "main.tf",
      module: "rules",
      language: "hcl",
      description: "Sigma Detection Rules S3 Storage, KMS Encryption, Vector IRSA IAM Read Policy, and Dynamic Hot-Reloading Strategies.",
      content: `# ------------------------------------------------------------------------------
# Sigma Rules S3 Storage & Dynamic Vector IRSA Integration
# ------------------------------------------------------------------------------

# 1. KMS Encryption Key for Sigma Detection Rules Bucket
resource "aws_kms_key" "sigma_rules_kms" {
  description             = "KMS Key for SecOps Sigma Rules S3 Storage"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "\${var.project_name}-\${var.environment}-sigma-rules-kms"
  }
}

# 2. S3 Bucket for Storing Production Sigma Rule YAML Files
resource "aws_s3_bucket" "secops_sigma_rules" {
  bucket        = "\${var.project_name}-\${var.environment}-sigma-rules"
  force_destroy = false

  tags = {
    Name         = "\${var.project_name}-\${var.environment}-sigma-rules"
    SecurityZone = "DetectionEngineering"
  }
}

resource "aws_s3_bucket_public_access_block" "sigma_rules_public_block" {
  bucket = aws_s3_bucket.secops_sigma_rules.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "sigma_rules_encryption" {
  bucket = aws_s3_bucket.secops_sigma_rules.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.sigma_rules_kms.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

# 3. IAM Policy granting EKS Vector Service Account (IRSA) Read Access to Sigma Rules
resource "aws_iam_policy" "vector_sigma_s3_read_policy" {
  name        = "\${var.project_name}-\${var.environment}-vector-sigma-read-policy"
  description = "Allows EKS Vector pod IRSA role to fetch Sigma rules from S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.secops_sigma_rules.arn,
          "\${aws_s3_bucket.secops_sigma_rules.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.sigma_rules_kms.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "vector_sigma_read_attach" {
  role       = var.vector_irsa_role_name
  policy_arn = aws_iam_policy.vector_sigma_s3_read_policy.arn
}

# ------------------------------------------------------------------------------
# Dynamic Vector Rule Loading Strategy (Implementation Options)
# ------------------------------------------------------------------------------
#
# STRATEGY 1: AWS S3 Sync Sidecar Container (Recommended for Hot Reloading)
# - The Vector Pod in EKS runs a secondary sidecar container: amazon/aws-cli.
# - Sidecar executes: aws s3 sync s3://\${aws_s3_bucket.secops_sigma_rules.bucket}/rules/ /etc/vector/rules/ --exact-timestamps --watch
# - Vector is started with --config-dir /etc/vector/rules/ and --watch-config.
# - When a security analyst pushes a new Sigma rule to S3, the sidecar syncs it to shared emptyDir volume,
#   and Vector automatically reloads detection rules in memory without zero-downtime pod restarts.
#
# STRATEGY 2: Kubernetes ConfigMap Synchronization via Operator / CronJob
# - An EKS Operator or CronJob polls the S3 bucket every 60 seconds.
# - Updates a Kubernetes ConfigMap vector-sigma-rules containing the rule YAMLs.
# - ConfigMap mount updates trigger Vector's in-memory hot reload listener.
#
# STRATEGY 3: Vector Native S3 Ingestion / External Fetcher
# - Vector v0.35+ native directory monitor watching mounted S3FS / EFS persistent volume endpoints.
# ------------------------------------------------------------------------------

# 4. Seed Initial Core Sigma Rule YAML Objects in S3
resource "aws_s3_object" "rule_ssh_bruteforce" {
  bucket       = aws_s3_bucket.secops_sigma_rules.id
  key          = "rules/authentication/ssh_bruteforce.yaml"
  content      = <<EOF
title: SSH Brute Force Authentication
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
level: high
EOF
  kms_key_id   = aws_kms_key.sigma_rules_kms.arn
  content_type = "text/yaml"
}

resource "aws_s3_object" "rule_cobalt_strike" {
  bucket       = aws_s3_bucket.secops_sigma_rules.id
  key          = "rules/dns/cobalt_strike_beacon.yaml"
  content      = <<EOF
title: Cobalt Strike C2 DNS Tunneling
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
level: critical
EOF
  kms_key_id   = aws_kms_key.sigma_rules_kms.arn
  content_type = "text/yaml"
}`
    }
  ];
}
