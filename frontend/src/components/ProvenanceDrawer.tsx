import React, { useState, useEffect } from "react";
import { X, FileText, CheckCircle } from "lucide-react";
import { fetchProvenanceData } from "../services/api";

interface ProvenanceDrawerProps {
  scenarioId: string;
  onClose: () => void;
}

export const ProvenanceDrawer: React.FC<ProvenanceDrawerProps> = ({
  scenarioId,
  onClose
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchProvenanceData(scenarioId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [scenarioId]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      right: 0,
      width: "440px",
      height: "100vh",
      backgroundColor: "#ffffff",
      boxShadow: "-4px 0 25px rgba(0, 0, 0, 0.15)",
      zIndex: 2000,
      display: "flex",
      flexDirection: "column",
      borderLeft: "1px solid var(--border-subtle)"
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={18} color="#2563eb" />
          <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>
            Provenance & Audit Manifest
          </span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", fontSize: "12px" }}>
        {loading ? (
          <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "30px" }}>Loading provenance ledger...</div>
        ) : data ? (
          <>
            <div style={{
              padding: "10px",
              backgroundColor: "#f8fafc",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px"
            }}>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                {data.scenario_name}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
                Dam: <strong>{data.dam_name}</strong> | Scenario ID: <code>{data.scenario_id}</code>
              </div>
            </div>

            {/* Solver & Terrain */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>
                Authoritative Physics Source
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", color: "var(--text-secondary)" }}>
                <div>• Hydraulic Solver: <strong>{data.solver}</strong></div>
                <div>• Digital Elevation Model: <strong>{data.terrain}</strong></div>
                <div>• Projected Coordinate System: <strong>{data.crs}</strong></div>
                <div>• EWE Decision Algorithm Version: <strong>v{data.algorithm_version}</strong></div>
              </div>
            </div>

            {/* SHA-256 Artifact Checksums */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>
                Immutable Artifact Signatures (SHA-256)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {Object.entries(data.artifacts || {}).map(([key, val]: [string, any]) => (
                  <div key={key} style={{
                    padding: "8px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "4px"
                  }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
                      {val.file} ({val.type || key})
                    </div>
                    <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#64748b", wordBreak: "break-all" }}>
                      {val.sha256}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Status */}
            <div style={{
              padding: "10px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#166534"
            }}>
              <CheckCircle size={16} />
              <div>
                <div style={{ fontWeight: 700 }}>{data.audit_trail.integrity_signature}</div>
                <div style={{ fontSize: "10px" }}>{data.audit_trail.verified_by}</div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
