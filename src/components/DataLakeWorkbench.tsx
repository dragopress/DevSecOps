import React, { useState } from "react";
import { IcebergTable, SqlQueryResult } from "../types";
import { icebergTables } from "../data/mockSecurityData";
import { 
  Database, 
  Play, 
  Table, 
  HardDrive, 
  Clock, 
  Layers, 
  Search, 
  CheckCircle2, 
  FileSpreadsheet,
  Zap,
  Info
} from "lucide-react";

export const DataLakeWorkbench: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<IcebergTable>(icebergTables[0]);
  const [sqlQuery, setSqlQuery] = useState<string>(icebergTables[0].sampleQueries[0]);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>({
    query: icebergTables[0].sampleQueries[0],
    executionTimeMs: 240,
    bytesScanned: "142.5 MB",
    snapshotId: "s3-iceberg-snap-99218204",
    columns: ["src_addr", "reject_count"],
    rows: [
      { src_addr: "198.51.100.44", reject_count: 1420 },
      { src_addr: "203.0.113.89", reject_count: 980 },
      { src_addr: "192.0.2.14", reject_count: 612 },
      { src_addr: "10.100.12.99", reject_count: 240 }
    ]
  });

  const handleRunQuery = () => {
    setIsQuerying(true);
    setTimeout(() => {
      setIsQuerying(false);
      setQueryResult({
        query: sqlQuery,
        executionTimeMs: Math.floor(Math.random() * 300 + 150),
        bytesScanned: `${(Math.random() * 200 + 50).toFixed(1)} MB`,
        snapshotId: `snap-iceberg-${Math.floor(Math.random() * 899999 + 100000)}`,
        columns: selectedTable.schema.slice(0, 5).map(s => s.field),
        rows: [
          { [selectedTable.schema[0].field]: "2026-08-01T04:05:12Z", [selectedTable.schema[1].field]: "198.51.100.44", [selectedTable.schema[2].field]: "10.100.10.88" },
          { [selectedTable.schema[0].field]: "2026-08-01T04:05:10Z", [selectedTable.schema[1].field]: "203.0.113.89", [selectedTable.schema[2].field]: "10.100.10.88" },
          { [selectedTable.schema[0].field]: "2026-08-01T04:05:08Z", [selectedTable.schema[1].field]: "192.0.2.1", [selectedTable.schema[2].field]: "10.100.20.44" }
        ]
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Matano Security Data Lake (S3 + Apache Iceberg Workbench)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Query normalized cybersecurity log tables via AWS Glue Catalog metadata & Apache Iceberg format using Amazon Athena / Trino.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-700">
          <HardDrive className="w-4 h-4 text-indigo-600" />
          <span>Total S3 Data Lake Storage:</span>
          <strong className="text-indigo-700 font-mono font-bold">46.5 GB</strong>
        </div>
      </div>

      {/* Main Grid: Table Explorer & Query Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Iceberg Table Schema Explorer */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-600" />
              AWS Glue Catalog Tables
            </h3>
            <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Apache Iceberg
            </span>
          </div>

          {/* Table List */}
          <div className="space-y-2">
            {icebergTables.map((tbl) => (
              <button
                key={tbl.name}
                onClick={() => {
                  setSelectedTable(tbl);
                  setSqlQuery(tbl.sampleQueries[0]);
                }}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                  selectedTable.name === tbl.name
                    ? "bg-blue-50 border-blue-200 text-blue-900 font-bold"
                    : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-900 font-bold">{tbl.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">{tbl.sizeGb} GB</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-medium">
                  <span>{tbl.recordCount.toLocaleString()} events</span>
                  <span className="text-indigo-600">Partitioned by {tbl.partitionFields[0]}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Schema Fields */}
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Table Schema ({selectedTable.name})
            </h4>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {selectedTable.schema.map((col) => (
                <div key={col.field} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
                  <span className="text-blue-700 font-bold">{col.field}</span>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">{col.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: SQL Editor & Results Workbench */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Athena / Trino Threat Hunting Workbench</h3>
            </div>

            <button
              onClick={handleRunQuery}
              disabled={isQuerying}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center space-x-2 self-start sm:self-auto"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isQuerying ? "Scanning Parquet Data..." : "Execute Query"}</span>
            </button>
          </div>

          {/* SQL Editor Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 uppercase">SQL Query Window</label>
              <span className="text-[10px] text-slate-500 font-mono font-medium">Database: {selectedTable.database}</span>
            </div>
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={4}
              className="w-full bg-[#1F2937] border border-slate-700 rounded-lg p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Query Execution Metrics */}
          {queryResult && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Execution Succeeded</span>
              </div>
              <div className="flex items-center space-x-4 text-slate-600 font-mono text-[11px]">
                <span>Time: <strong className="text-amber-700">{queryResult.executionTimeMs} ms</strong></span>
                <span>Scanned: <strong className="text-blue-700">{queryResult.bytesScanned}</strong></span>
                <span>Snapshot: <strong className="text-indigo-700">{queryResult.snapshotId}</strong></span>
              </div>
            </div>
          )}

          {/* Result Data Table */}
          {queryResult && (
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <div className="p-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Returned Parquet Query Results</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    <tr>
                      {queryResult.columns.map((col) => (
                        <th key={col} className="px-4 py-2 font-bold">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {queryResult.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        {queryResult.columns.map((col) => (
                          <td key={col} className="px-4 py-2.5 whitespace-nowrap">
                            {String(row[col] ?? "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
