import React, { useState } from "react";
import { 
  Database, 
  BarChart3, 
  Workflow, 
  Zap, 
  Play, 
  RotateCcw, 
  Layers, 
  Server, 
  Code2, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  Sliders, 
  Table, 
  Filter, 
  Search, 
  Download, 
  PieChart, 
  TrendingUp, 
  Activity, 
  Cpu, 
  Box, 
  Check, 
  X, 
  Clock, 
  Settings, 
  Copy
} from "lucide-react";

export interface EtlPipeline {
  id: string;
  name: string;
  sourceConnector: string;
  targetConnector: string;
  transformationRulesCount: number;
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  lastRunRows: number;
  lastRunTime: string;
  avgThroughputRowsPerSec: number;
}

export interface ExtractedColumn {
  name: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  transformationMask: 'None' | 'SHA-256 Hash' | 'Anonymize' | 'Uppercase' | 'Format Date';
}

export interface BiWidget {
  id: string;
  title: string;
  type: 'METRIC' | 'BAR' | 'PIE';
  metricValue?: string;
  subtext?: string;
  dataPoints?: { label: string; value: number; color?: string }[];
}

export const EnterpriseDataAnalyticsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dataconnect' | 'columnar-query' | 'bi-dashboard' | 'architecture'>('dataconnect');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- 1. DATACONNECT PIPELINE BUILDER STATE ---
  const [pipelines, setPipelines] = useState<EtlPipeline[]>([
    {
      id: "pipe-01",
      name: "SAP ERP Financials -> Actian Columnar Data Warehouse",
      sourceConnector: "SAP ERP (PostgreSQL CDC)",
      targetConnector: "Actian Vector Columnar Store",
      transformationRulesCount: 8,
      status: "SUCCESS",
      lastRunRows: 1450000,
      lastRunTime: "12 mins ago",
      avgThroughputRowsPerSec: 1250000
    },
    {
      id: "pipe-02",
      name: "Salesforce CRM Lead Pipeline Sync",
      sourceConnector: "Salesforce REST API / Webhooks",
      targetConnector: "Snowflake / Local Parquet Storage",
      transformationRulesCount: 4,
      status: "IDLE",
      lastRunRows: 320000,
      lastRunTime: "1 hour ago",
      avgThroughputRowsPerSec: 850000
    },
    {
      id: "pipe-03",
      name: "Real-time IoT Telemetry Stream ELT",
      sourceConnector: "Apache Kafka Topic (`telemetry.raw`)",
      targetConnector: "Actian Real-time Memory Analytics",
      transformationRulesCount: 6,
      status: "RUNNING",
      lastRunRows: 8900000,
      lastRunTime: "Streaming Now",
      avgThroughputRowsPerSec: 2400000
    }
  ]);

  // Live Schema Extractor State
  const [extractedColumns, setExtractedColumns] = useState<ExtractedColumn[]>([
    { name: "customer_id", dataType: "UUID", isNullable: false, isPrimaryKey: true, transformationMask: "None" },
    { name: "email_address", dataType: "VARCHAR(255)", isNullable: false, isPrimaryKey: false, transformationMask: "SHA-256 Hash" },
    { name: "credit_card_token", dataType: "VARCHAR(64)", isNullable: true, isPrimaryKey: false, transformationMask: "Anonymize" },
    { name: "annual_revenue", dataType: "NUMERIC(15,2)", isNullable: false, isPrimaryKey: false, transformationMask: "None" },
    { name: "signup_timestamp", dataType: "TIMESTAMP WITH TIMEZONE", isNullable: false, isPrimaryKey: false, transformationMask: "Format Date" }
  ]);

  const handleRunPipeline = (pipeId: string) => {
    setPipelines(prev => prev.map(p => p.id === pipeId ? { ...p, status: 'RUNNING' } : p));
    showToast(`Triggered DataConnect ETL Pipeline ${pipeId}...`);

    setTimeout(() => {
      setPipelines(prev => prev.map(p => p.id === pipeId ? {
        ...p,
        status: 'SUCCESS',
        lastRunRows: p.lastRunRows + 120000,
        lastRunTime: 'Just now'
      } : p));
      showToast(`Pipeline ${pipeId} execution finished successfully! Transformed and ingested rows into Columnar Store.`);
    }, 2000);
  };

  const handleUpdateTransformation = (colName: string, newMask: ExtractedColumn['transformationMask']) => {
    setExtractedColumns(prev => prev.map(c => c.name === colName ? { ...c, transformationMask: newMask } : c));
    showToast(`Updated data transformation rule for column '${colName}' to ${newMask}`);
  };

  // --- 2. ANALYTICAL QUERY ENGINE STATE (COLUMNAR & SQL AGGREGATION) ---
  const [selectedSqlQuery, setSelectedSqlQuery] = useState<string>(
    `SELECT 
  product_category,
  region,
  COUNT(transaction_id) AS total_orders,
  SUM(gross_revenue) AS category_revenue,
  AVG(processing_latency_ms) AS avg_latency
FROM vector_analytics_ledger_columnar
WHERE transaction_date >= '2026-01-01'
GROUP BY product_category, region
ORDER BY category_revenue DESC
LIMIT 10;`
  );

  const [queryExecutionMetrics, setQueryExecutionMetrics] = useState<{
    executionTimeMs: number;
    rowsScanned: number;
    compressedBlocksUsed: number;
    vectorSimdParallelism: string;
  } | null>({
    executionTimeMs: 14.2,
    rowsScanned: 124500000,
    compressedBlocksUsed: 384,
    vectorSimdParallelism: "AVX-512 (64 Cores Active)"
  });

  const [queryResults, setQueryResults] = useState<{
    product_category: string;
    region: string;
    total_orders: string;
    category_revenue: string;
    avg_latency: string;
  }[]>([
    { product_category: "Enterprise Cloud Infra", region: "EMEA", total_orders: "1,420,890", category_revenue: "$84,290,000", avg_latency: "1.2 ms" },
    { product_category: "Cybersecurity Suite", region: "NA-EAST", total_orders: "980,450", category_revenue: "$62,110,000", avg_latency: "0.9 ms" },
    { product_category: "MarTech Automation", region: "APAC", total_orders: "650,120", category_revenue: "$41,800,000", avg_latency: "1.5 ms" },
    { product_category: "Workspace Low-Code", region: "LATAM", total_orders: "410,230", category_revenue: "$28,450,000", avg_latency: "1.1 ms" }
  ]);

  const handleExecuteQuery = () => {
    showToast("Executing vectorized analytical query on Actian Columnar Engine...");
    setQueryExecutionMetrics(null);

    setTimeout(() => {
      setQueryExecutionMetrics({
        executionTimeMs: Number((Math.random() * 8 + 8).toFixed(1)),
        rowsScanned: 124500000,
        compressedBlocksUsed: 384,
        vectorSimdParallelism: "AVX-512 (64 Cores Active)"
      });
      showToast("Query executed in 12.4ms across 124.5 Million columnar rows!");
    }, 1000);
  };

  // --- 3. CUSTOMIZABLE BI REPORTING DASHBOARD WIDGETS ---
  const [biWidgets, setBiWidgets] = useState<BiWidget[]>([
    {
      id: "w-01",
      title: "Real-time Columnar Scan Speed",
      type: "METRIC",
      metricValue: "8.85 GB/sec",
      subtext: "Vectorized SIMD AVX-512 Acceleration"
    },
    {
      id: "w-02",
      title: "Query Latency SLA Distribution",
      type: "METRIC",
      metricValue: "99.4% < 20ms",
      subtext: "Sub-second OLAP Query Target Met"
    },
    {
      id: "w-03",
      title: "Revenue by Product Division ($M)",
      type: "BAR",
      dataPoints: [
        { label: "Cloud Infra", value: 84.2, color: "bg-indigo-500" },
        { label: "SecOps", value: 62.1, color: "bg-emerald-500" },
        { label: "MarTech", value: 41.8, color: "bg-amber-500" },
        { label: "Low-Code", value: 28.4, color: "bg-purple-500" }
      ]
    }
  ]);

  const [newWidgetTitle, setNewWidgetTitle] = useState("");
  const [newWidgetType, setNewWidgetType] = useState<'METRIC' | 'BAR'>('METRIC');
  const [newWidgetValue, setNewWidgetValue] = useState("");

  const handleAddWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWidgetTitle.trim()) return;

    const created: BiWidget = {
      id: `w-${Date.now()}`,
      title: newWidgetTitle,
      type: newWidgetType,
      metricValue: newWidgetValue || "100%",
      subtext: "Custom User Widget"
    };

    setBiWidgets([...biWidgets, created]);
    setNewWidgetTitle("");
    setNewWidgetValue("");
    showToast(`Added custom BI reporting widget "${created.title}"`);
  };

  const handleDeleteWidget = (id: string) => {
    setBiWidgets(biWidgets.filter(w => w.id !== id));
    showToast("Removed BI widget.");
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-800 border border-indigo-500/80 text-indigo-200 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-amber-600 text-white font-bold text-xs rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> Pillar 5 Operational Service
              </span>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-0.5 rounded-md">
                Actian Data Platform Architecture
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Database className="w-8 h-8 text-indigo-400" />
              Enterprise DataConnect & Vectorized Columnar Analytics
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Low-code ETL/ELT pipeline builder with automated schema extraction, SIMD-accelerated columnar query engine, and interactive BI reporting dashboard widgets.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex flex-col border-r border-slate-800 pr-4">
              <span className="text-slate-400 font-sans font-medium">Scan Throughput</span>
              <span className="text-emerald-400 font-bold mt-0.5">8.85 GB/sec Vectorized</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-sans font-medium">Column Compression</span>
              <span className="text-indigo-400 font-bold mt-0.5">10:1 Ratio (Parquet/Vector)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('dataconnect')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dataconnect'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Workflow className="w-4 h-4 text-amber-300" />
            <span>DataConnect ETL Pipeline Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('columnar-query')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'columnar-query'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-300" />
            <span>Analytical Query Engine (Columnar)</span>
          </button>

          <button
            onClick={() => setActiveTab('bi-dashboard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'bi-dashboard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <PieChart className="w-4 h-4 text-purple-300" />
            <span>BI Reporting Dashboard Widgets</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Code2 className="w-4 h-4 text-indigo-300" />
            <span>Microservice Repo & Contracts</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DATACONNECT ETL PIPELINE BUILDER */}
      {activeTab === 'dataconnect' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-amber-400" />
                DataConnect Low-Code ETL/ELT Pipeline Orchestrator
              </h2>
              <p className="text-xs text-slate-400">Extracts schemas, transforms fields, masks PII, and streams clean data into the vectorized columnar data lakehouse.</p>
            </div>

            <span className="text-xs font-mono text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800 font-bold">
              3 Active Pipelines Running
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pipelines List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Active Ingestion & Transformation Streams
                </h3>
              </div>

              <div className="space-y-3">
                {pipelines.map(pipe => (
                  <div key={pipe.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{pipe.name}</span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        pipe.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : pipe.status === 'RUNNING'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                          : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                      }`}>
                        {pipe.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400">
                      <div>Source: <strong className="text-amber-300">{pipe.sourceConnector}</strong></div>
                      <div>Target: <strong className="text-emerald-400">{pipe.targetConnector}</strong></div>
                      <div>Throughput: <strong className="text-indigo-300">{(pipe.avgThroughputRowsPerSec / 1000000).toFixed(2)}M rows/s</strong></div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-500">Last Execution: {pipe.lastRunRows.toLocaleString()} rows ingested ({pipe.lastRunTime})</span>

                      <button
                        onClick={() => handleRunPipeline(pipe.id)}
                        disabled={pipe.status === 'RUNNING'}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Run ETL Stream</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schema Extractor & Masking Engine */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  Database Schema Extractor & Masker
                </h3>
              </div>

              <p className="text-xs text-slate-400">Extracted schema fields from `customers_master` source table. Configure PII field transformation masks:</p>

              <div className="space-y-2">
                {extractedColumns.map(col => (
                  <div key={col.name} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{col.name}</span>
                      <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">{col.dataType}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">Transform Mask:</span>
                      <select
                        value={col.transformationMask}
                        onChange={(e) => handleUpdateTransformation(col.name, e.target.value as any)}
                        className="bg-slate-900 border border-slate-800 text-amber-300 text-[10px] rounded px-2 py-1 font-mono focus:outline-none"
                      >
                        <option value="None">None</option>
                        <option value="SHA-256 Hash">SHA-256 Hash</option>
                        <option value="Anonymize">Anonymize</option>
                        <option value="Uppercase">Uppercase</option>
                        <option value="Format Date">Format Date</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICAL QUERY ENGINE (COLUMNAR & SQL) */}
      {activeTab === 'columnar-query' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                Vectorized Columnar Analytical Query Engine
              </h2>
              <p className="text-xs text-slate-400">SIMD AVX-512 vector execution over memory-aligned columnar blocks. Instant aggregations over hundreds of millions of records.</p>
            </div>

            <span className="text-xs font-mono text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800 font-bold">
              Vectorized Engine Warm
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SQL Execution Console */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  Columnar SQL Query Console
                </h3>

                <button
                  onClick={handleExecuteQuery}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Vectorized Query</span>
                </button>
              </div>

              <textarea
                value={selectedSqlQuery}
                onChange={(e) => setSelectedSqlQuery(e.target.value)}
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 text-emerald-300 p-3 rounded-xl font-mono text-xs focus:outline-none"
              />

              {/* Execution Metrics Bar */}
              {queryExecutionMetrics && (
                <div className="p-3 bg-slate-950 rounded-xl border border-emerald-800/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">Latency: </span>
                    <strong className="text-emerald-400">{queryExecutionMetrics.executionTimeMs} ms</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Rows Scanned: </span>
                    <strong className="text-indigo-300">{(queryExecutionMetrics.rowsScanned / 1000000).toFixed(1)}M</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Compressed Column Blocks: </span>
                    <strong className="text-amber-300">{queryExecutionMetrics.compressedBlocksUsed} blocks</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Hardware: </span>
                    <strong className="text-purple-300">{queryExecutionMetrics.vectorSimdParallelism}</strong>
                  </div>
                </div>
              )}

              {/* Aggregation Results Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">Aggregated Query Results Output:</h4>
                <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="p-3">Product Category</th>
                        <th className="p-3">Region</th>
                        <th className="p-3 text-right">Total Orders</th>
                        <th className="p-3 text-right">Category Revenue</th>
                        <th className="p-3 text-right">Avg Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {queryResults.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="p-3 font-bold text-indigo-300">{row.product_category}</td>
                          <td className="p-3 text-amber-300">{row.region}</td>
                          <td className="p-3 text-right">{row.total_orders}</td>
                          <td className="p-3 text-right font-bold text-emerald-400">{row.category_revenue}</td>
                          <td className="p-3 text-right text-slate-400">{row.avg_latency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Vector Columnar Architecture Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Actian Vector Storage Breakdown
                </h3>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="text-amber-300 font-bold">1. SIMD Vector Execution</div>
                <p className="text-slate-400 text-[11px] font-sans">Applies CPU AVX-512 vector registers directly over compressed column arrays without row deserialization overhead.</p>

                <div className="text-emerald-400 font-bold pt-2 border-t border-slate-800">2. Run-Length Encoding (RLE)</div>
                <p className="text-slate-400 text-[11px] font-sans">High-ratio dictionary compression reduces I/O bottleneck by 90% compared to row-oriented databases.</p>

                <div className="text-indigo-400 font-bold pt-2 border-t border-slate-800">3. Memory Locality Cache</div>
                <p className="text-slate-400 text-[11px] font-sans">Keep hot analytical columns pinned in CPU L3 cache for sub-10ms OLAP aggregate responses.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMIZABLE BI REPORTING DASHBOARD WIDGETS */}
      {activeTab === 'bi-dashboard' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-400" />
                Customizable BI Reporting Dashboard Widgets
              </h2>
              <p className="text-xs text-slate-400">Create, customize, and display real-time business intelligence KPI cards and analytical reporting widgets.</p>
            </div>

            <span className="text-xs font-mono text-purple-300 bg-purple-950 px-3 py-1 rounded-full border border-purple-800 font-bold">
              Live Widget Engine Active
            </span>
          </div>

          {/* Add Widget Controls */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <form onSubmit={handleAddWidget} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newWidgetTitle}
                onChange={(e) => setNewWidgetTitle(e.target.value)}
                placeholder="New Widget Title (e.g. Active Daily Queries)"
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 flex-1 focus:outline-none"
              />

              <select
                value={newWidgetType}
                onChange={(e) => setNewWidgetType(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-amber-300 text-xs rounded-xl p-2.5 font-mono focus:outline-none"
              >
                <option value="METRIC">KPI Metric Card</option>
                <option value="BAR">Bar Distribution Chart</option>
              </select>

              <input
                type="text"
                value={newWidgetValue}
                onChange={(e) => setNewWidgetValue(e.target.value)}
                placeholder="Metric Value (e.g. 14,250 / sec)"
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 w-48 focus:outline-none"
              />

              <button
                type="submit"
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom BI Widget</span>
              </button>
            </form>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {biWidgets.map(widget => (
              <div key={widget.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 relative group">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    {widget.title}
                  </h3>

                  <button
                    onClick={() => handleDeleteWidget(widget.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {widget.type === 'METRIC' ? (
                  <div className="py-2 space-y-1">
                    <div className="text-2xl font-extrabold text-white font-mono">{widget.metricValue}</div>
                    <div className="text-[11px] text-slate-400">{widget.subtext}</div>
                  </div>
                ) : (
                  <div className="space-y-2 py-1">
                    {widget.dataPoints?.map((dp, idx) => (
                      <div key={idx} className="space-y-1 text-xs font-mono">
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span>{dp.label}</span>
                          <span className="font-bold">${dp.value}M</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full ${dp.color || 'bg-purple-500'}`}
                            style={{ width: `${(dp.value / 100) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ARCHITECTURE & CONTRACTS */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                Service Repo Architecture: `enterprise-data-analytics-service`
              </h2>
              <p className="text-xs text-slate-400">Isolated service repository with Dockerfile, gRPC/Protobuf contracts, and PostgreSQL analytics metadata store.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-indigo-300 font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                `services/data-analytics/Dockerfile`
              </span>
              <pre className="bg-slate-900 p-3 rounded-lg text-emerald-300 font-mono text-[11px] overflow-x-auto">
{`FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 50061
CMD ["node", "dist/server.cjs"]`}
              </pre>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                `proto/data_analytics_v1.proto` (gRPC Contract)
              </span>
              <pre className="bg-slate-900 p-3 rounded-lg text-indigo-300 font-mono text-[11px] overflow-x-auto">
{`syntax = "proto3";
package enterprise.data.v1;

service EnterpriseDataAnalyticsService {
  rpc TriggerEtlPipeline (PipelineRequest) returns (PipelineResponse);
  rpc ExecuteColumnarQuery (QueryRequest) returns (QueryResponse);
  rpc ExtractDatabaseSchema (SchemaRequest) returns (SchemaResponse);
}

message QueryRequest {
  string sql_statement = 1;
  int32 max_rows = 2;
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
