import { Pool } from "pg";

export const complianceDbPool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://compliance_mgr:CompliancePass2026!@postgres-compliance.internal:5432/policy_compliance_db?sslmode=require",
  max: 10,
  idleTimeoutMillis: 30000,
});

export async function testComplianceDbConnection(): Promise<{ connected: boolean; latencyMs: number; database: string }> {
  const start = Date.now();
  try {
    const client = await complianceDbPool.connect();
    const res = await client.query("SELECT current_database()");
    client.release();
    return {
      connected: true,
      latencyMs: Date.now() - start,
      database: res.rows[0].current_database,
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      database: "policy_compliance_db",
    };
  }
}

export const schemaTables = [
  "rego_policies_store",
  "cis_benchmark_historical_scans",
  "opa_decision_audit_log"
];
