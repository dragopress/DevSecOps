# DevSecOps Security Pipeline & Threat Detection Studio

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enterprise-grade, interactive DevSecOps platform built to simulate end-to-end cloud security pipelines, author & test custom Sigma detection rules, inspect infrastructure-as-code (IaC) compliance, and manage cloud data lake security architectures.

---

## 🌟 Key Features

### 1. 🔄 Visual CI/CD Workflow Pipeline Graph
* **6-Stage Commit-to-Deploy Execution**: Real-time visual pipeline graph tracking code commit triggers, static code analysis & secret scanning, Checkov IaC security benchmarks, Terraform plan diffing, OPA policy gates, and AWS cloud deployment.
* **Stage Inspection Drawer**: Interactive node selection providing granular log telemetry, verified security sub-checks, and execution time metrics for each stage.
* **CodeBuild & Checkov Inspector**: Integrated terminal logs with live filterable IaC policy compliance findings.

### 2. 🛡️ Threat Detection Sandbox & Sigma Rule Engine
* **Sigma YAML Studio**: Live syntax editor with real-time YAML validation, field verification, and warning hints.
* **SIEM Query Translator**: Auto-converts Sigma rules into Splunk SPL, Elastic Lucene/EQL, AWS Athena SQL, and Microsoft Sentinel KQL.
* **Live Security Log Streaming**: Real-time simulated ingestion stream (AWS CloudTrail, VPC Flow Logs, GuardDuty, Sysmon, Kubernetes Audit) with match highlighting.

### 3. 📦 Unified Session Export & Import Package System
* **Export Package**: Download complete pipeline environment configurations and custom Sigma rules as a unified JSON package (`secops-pipeline-*.json`).
* **Import Package**: Instantly restore studio sessions, active detection rules, and infrastructure variables from previously exported project files.

### 4. 🕸️ Interactive D3 Infrastructure Topology & Data Lake
* **Dynamic Node Graph**: D3.js powered interactive architecture topology map displaying AWS DevSecOps flows (WAF, GuardDuty, Kinesis, S3 Data Lake, OpenSearch, Security Hub).
* **Data Lake Workbench**: S3 Lifecycle policies simulator (Glacier transitions, retention expiration) and interactive SQL log query editor.

### 5. 🤖 AI Security Architect & Rule Generator
* **AI Threat Assistant**: Powered by server-side Gemini AI for automated threat detection rule drafting, security posture analysis, and compliance remediation recommendations.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
* **Visualizations**: D3.js (Interactive Graph Layouts)
* **Backend**: Express.js + Vite Server-Side Middleware
* **AI Engine**: `@google/genai` TypeScript SDK (Server-Side Execution)
* **Build System**: Vite + `esbuild` CommonJS server packager

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm** or **bun**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/devsecops-pipeline-studio.git
   cd devsecops-pipeline-studio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and add your optional Gemini API key for AI features:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env`:*
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Starts the Express server with Vite middleware on port 3000 |
| `build` | `npm run build` | Bundles Vite client assets and compiles `server.ts` with esbuild |
| `start` | `npm run start` | Runs the compiled server production bundle (`dist/server.cjs`) |
| `lint` | `npm run lint` | Runs TypeScript typechecker (`tsc --noEmit`) |

---

## 📁 Repository Structure

```
├── src/
│   ├── components/            # UI Module Components
│   │   ├── ArchitectureTopology.tsx    # AWS D3 Architecture Map
│   │   ├── CiCdScanner.tsx             # Visual CI/CD Workflow Pipeline Graph
│   │   ├── D3TopologyGraph.tsx         # D3 Force-Directed Graph Layout
│   │   ├── DataLakeWorkbench.tsx       # S3 Data Lake & SQL Workbench
│   │   ├── DeploymentSimulator.tsx     # Cloud Infrastructure Simulator
│   │   ├── Header.tsx                  # Top Header with Package Export/Import
│   │   ├── InfrastructurePolicyCheck.tsx # OPA & CIS Benchmark Scanner
│   │   ├── TerraformInspector.tsx      # Live HCL Inspector
│   │   ├── ThreatDetectionSandbox.tsx  # Sigma Rule Studio & Log Generator
│   │   ├── AiArchitect.tsx             # AI Security Posture Assistant
│   │   └── AiSigmaGenerator.tsx        # AI Sigma Rule Synthesizer
│   ├── data/                           # Mock Datasets & Sigma Templates
│   ├── utils/                          # Sigma Validation Engine
│   ├── types.ts                        # TypeScript Type Declarations
│   ├── App.tsx                         # Main Application Container
│   └── main.tsx                        # React Entry Point
├── server.ts                           # Express Server + Vite Middleware
├── metadata.json                       # Applet Configuration
├── package.json                        # Dependencies & Scripts
└── README.md                           # Project Documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
