# DevSecOps Security Pipeline & Threat Detection Studio

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enterprise-grade, interactive DevSecOps platform built to simulate end-to-end cloud security pipelines, author & test custom Sigma detection rules, inspect infrastructure-as-code (IaC) compliance, and manage cloud data lake security architectures.

---

## 🏗️ DevSecOps Pipeline Architecture

```
[ Developer Commit ] ---> [ Stage 1: Source & Webhook HMAC ]
                                |
                                v
                      [ Stage 2: gitleaks & tflint Secret Audit ]
                                |
                                v
                      [ Stage 3: Checkov & tfsec IaC Benchmarks ]
                                |
                                v
                      [ Stage 4: S3 Remote State & Terraform Plan Diff ]
                                |
                                v
                      [ Stage 5: OPA Conftest & Security Approval Gate ]
                                |
                                v
                      [ Stage 6: AWS Cloud Deploy & Security Hub Sync ]
                                |
                                +--> [ SIEM Log Stream (CloudTrail / VPC / Sysmon) ]
                                |          |
                                |          v
                                +--> [ Sigma Engine & SIEM Query Translator ]
```

The architecture models an enterprise Cloud Native Security Posture Management (CSPM) and SIEM detection engineering pipeline:
1. **Source Ingestion & Verification**: Cryptographic commit verification and HMAC payload authentication.
2. **Static Code Analysis (SAST)**: Scanning HCL configuration files for hardcoded secrets, API tokens, and formatting syntax.
3. **Infrastructure-as-Code (IaC) Compliance**: Automated checking against CIS Benchmarks, SOC2, and PCI-DSS rules via Checkov and tfsec.
4. **State Diff & Synthesis**: Synthesizing resource diffs against remote AWS S3 state backends with DynamoDB locking.
5. **Policy as Code Gate (OPA)**: Open Policy Agent evaluation enforcing encryption-at-rest (KMS CMK), transit encryption (mTLS), and API endpoint visibility.
6. **Continuous Security Operations (SecOps)**: Streaming real-time telemetry from AWS CloudTrail, VPC Flow Logs, and Kubernetes Audit logs into the Sigma rule validation engine.

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **bun** package manager

### 1. Clone & Install
```bash
git clone https://github.com/your-username/devsecops-pipeline-studio.git
cd devsecops-pipeline-studio
npm install
```

### 2. Configure Environment
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
*(Optional)* Add a Gemini API key to enable server-side AI-assisted security recommendations and Sigma rule generation:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Launch Development Application
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your web browser.

---

## 💻 Development Workflow

### Development Server
The application runs on an Express backend hosting Vite development middleware on port `3000`. Hot Module Replacement (HMR) and static asset serving are handled seamlessly by Express in development mode.

```bash
npm run dev
```

### Type Checking & Linting
Run TypeScript type checks across all components, server scripts, and utilities:
```bash
npm run lint
```

### Production Build & Bundling
The build process compiles Vite client assets to `/dist` and uses `esbuild` to bundle `server.ts` into a CommonJS production file `dist/server.cjs`:
```bash
npm run build
npm run start
```

---

## 🛡️ Included Security Modules

### 1. Visual CI/CD Workflow Pipeline Graph (`CiCdScanner.tsx`)
- **Interactive Stage Graph**: 6-stage execution tracking from commit to cloud deployment.
- **Deep Inspection Drawer**: Interactive node selection showing verified security controls, duration metrics, and terminal logs.
- **Checkov Findings Inspector**: Filterable policy compliance report detailing high, medium, and low severity IaC violations.

### 2. Threat Detection Sandbox & Sigma Studio (`ThreatDetectionSandbox.tsx`)
- **Sigma Rule Editor**: Live YAML editor with real-time field validation, MITRE ATT&CK mapping, and error highlighting.
- **Multi-SIEM Translation Engine**: Real-time cross-compilation into Splunk SPL, Elastic Lucene/EQL, AWS Athena SQL, and Microsoft Sentinel KQL.
- **Live Log Stream**: Simulated security log stream highlighting rule matches in real-time.

### 3. Interactive D3 Infrastructure Topology (`ArchitectureTopology.tsx` & `D3TopologyGraph.tsx`)
- **Force-Directed Graph**: Visual node topology illustrating AWS WAF, KMS, MSK, EKS, CloudTrail, S3 Data Lake, OpenSearch, and Security Hub integrations.
- **Flow Visualizer**: Animated data flow particles representing log ingress and alert dispatching.

### 4. Data Lake & S3 Lifecycle Workbench (`DataLakeWorkbench.tsx`)
- **Lifecycle Simulator**: S3 lifecycle rule engine managing transitions to Glacier Flexible and Deep Archive.
- **Interactive SQL Log Console**: SQL querying engine for raw Security Hub and VPC Flow Logs.

### 5. Infrastructure Policy Inspector (`InfrastructurePolicyCheck.tsx`)
- **Policy Compliance Grid**: Real-time CIS AWS Foundations Benchmark compliance checker evaluating encryption, network isolation, and identity policies.

### 6. AI Security Architect (`AiArchitect.tsx` & `AiSigmaGenerator.tsx`)
- **Gemini Powered Synthesis**: Automated assistant providing security posture evaluations, remediation suggestions, and automated Sigma rule synthesis.

---

## 💡 Recommended Architecture & Performance Enhancements

The following improvements are proposed to elevate the platform's scalability, performance, and enterprise integration capabilities:

### 1. WebAssembly (Wasm) In-Browser OPA Policy Engine
* **Expected Benefit**: Enables instant, client-side evaluation of custom Rego policies without server roundtrips.
* **Complexity**: Medium
* **Priority**: High
* **Risks**: Increased initial bundle size (~1.2MB for Wasm runtime).
* **Estimated Performance Gain**: **~85% faster policy evaluations** (<5ms vs ~35ms server delay).
* **Recommended Solution**: Integrate `@open-policy-agent/opa-wasm` to compile Rego rules directly in the browser web worker.

### 2. WebWorker Log Stream Filter & Parser
* **Expected Benefit**: Offloads real-time regex matching and Sigma detection evaluation for high-volume log streams (10,000+ EPS) from the main UI thread.
* **Complexity**: Low - Medium
* **Priority**: High
* **Risks**: Asynchronous message passing overhead for small log batches.
* **Estimated Performance Gain**: **Eliminates UI frame drops (60 FPS maintained)** during high EPS log bursts.
* **Recommended Solution**: Move log stream evaluation and Sigma matching into a dedicated HTML5 WebWorker (`/src/workers/sigmaWorker.ts`).

### 3. Server-Sent Events (SSE) Streaming for Live Telemetry
* **Expected Benefit**: Provides true push-based streaming for live security log events and multi-stage CI/CD pipeline notifications from the Express backend.
* **Complexity**: Low
* **Priority**: Medium
* **Risks**: Requires managing client reconnect state on network drops.
* **Estimated Performance Gain**: **~40% reduction in network overhead** compared to client polling loops.
* **Recommended Solution**: Expose `/api/stream/logs` and `/api/stream/pipeline` SSE endpoints in `server.ts`.

### 4. Canvas-Based D3 Topology Rendering for High-Node Networks
* **Expected Benefit**: Scales the architecture topology map to support enterprise networks with 1,000+ nodes and edges without DOM degradation.
* **Complexity**: Medium - High
* **Priority**: Medium
* **Risks**: Loss of default SVG CSS styling capabilities; requires custom hit testing for hover nodes.
* **Estimated Performance Gain**: **~300% rendering speedup** for networks exceeding 250 visual nodes.
* **Recommended Solution**: Upgrade `D3TopologyGraph.tsx` to conditionally render on HTML5 Canvas when node count exceeds 100.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
